<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Inventory\InventoryService;
use App\Services\Payment\MidtransService;
use App\Services\Shipping\ShippingService;
use App\Support\AuditLogger;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly StockReservationService $stockService,
        private readonly MidtransService $midtransService,
        private readonly InventoryService $inventoryService,
        private readonly ShippingService $shippingService,
    ) {}

    /**
     * Proses checkout dari cart ke order + Midtrans Snap.
     *
     * @param  array<string, mixed>  $checkoutData  Validated dari CheckoutRequest
     * @return array{order: Order, snap_token: string, payment_url: string}
     *
     * @throws \RuntimeException  Jika Midtrans gagal
     */
    public function checkout(array $checkoutData, User $user): array
    {
        $cartKey   = $this->cartService->getAuthKey($user->id);
        $cartItems = $this->cartService->get($cartKey);

        if (empty($cartItems)) {
            abort(422, 'Keranjang belanja kosong.');
        }

        // Hitung ulang ongkir di server (harga tidak dipercaya dari client).
        // Dilakukan di luar transaction agar panggilan provider tidak memperpanjang lock DB.
        $rate = $this->shippingService->resolveRate(
            $cartItems,
            $checkoutData['shipping_postal_code'],
            $checkoutData['shipping_courier'],
            $checkoutData['shipping_service'],
        );

        if (! $rate) {
            abort(422, 'Opsi pengiriman tidak valid. Silakan muat ulang ongkir.');
        }

        $order = $this->createOrderInTransaction($cartItems, $checkoutData, $user, $rate);

        // Panggil Midtrans di luar transaction agar tidak memperpanjang lock DB
        try {
            $snap = $this->midtransService->isMockMode()
                ? $this->midtransService->createMockSnap($order)
                : $this->midtransService->createSnap($order->load('items'));

            $order->update([
                'payment_token' => $snap['token'],
                'payment_url'   => $snap['redirect_url'],
            ]);
        } catch (\Throwable $e) {
            // Midtrans gagal: kembalikan stok, tandai order gagal
            $this->stockService->release(
                array_map(fn ($i) => ['variant_id' => $i['variant_id'], 'quantity' => $i['quantity']], $cartItems)
            );
            $this->inventoryService->logRelease($order->load('items'));
            $order->update(['status' => OrderStatus::PaymentFailed]);
            AuditLogger::log('status_changed', $order,
                ['status' => 'pending_payment'],
                ['status' => 'payment_failed', 'reason' => 'midtrans_error'],
            );

            throw new \RuntimeException('Gagal membuat sesi pembayaran. Silakan coba lagi.', 0, $e);
        }

        // Bersihkan cart setelah sukses
        $this->cartService->clear($cartKey);

        return [
            'order'       => $order->load('items'),
            'snap_token'  => $snap['token'],
            'payment_url' => $snap['redirect_url'],
        ];
    }

    private function createOrderInTransaction(
        array $cartItems,
        array $checkoutData,
        User $user,
        \App\Services\Shipping\ShippingRate $rate,
    ): Order {
        return DB::transaction(function () use ($cartItems, $checkoutData, $user, $rate) {
            $variantIds = array_column($cartItems, 'variant_id');
            $productIds = array_column($cartItems, 'product_id');

            // Lock semua variant yang terlibat untuk cegah race condition stok
            $variants = ProductVariant::lockForUpdate()
                ->whereIn('id', $variantIds)
                ->get()
                ->keyBy('id');

            // Load produk untuk ambil revenue_share_percent
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

            // Validasi stok
            foreach ($cartItems as $item) {
                $variant = $variants->get($item['variant_id']);
                if (! $variant || $variant->stock < $item['quantity']) {
                    abort(409, "Stok {$item['product_name']} tidak mencukupi.");
                }
            }

            // Snapshot stok sebelum dipotong (untuk inventory log)
            $stockBefore = $variants->mapWithKeys(fn ($v) => [$v->id => $v->stock])->all();

            // Potong stok (provisional — dikembalikan jika bayar gagal)
            $this->stockService->reserve(
                array_map(fn ($i) => ['variant_id' => $i['variant_id'], 'quantity' => $i['quantity']], $cartItems)
            );

            // Hitung total
            $subtotal      = 0;
            $shippingTotal = $rate->cost; // sen — sudah dihitung ulang di server

            foreach ($cartItems as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }

            $grandTotal = $subtotal + $shippingTotal;

            // Generate nomor order: GRV-YYYYMMDD-NNNN
            $count       = Order::whereDate('created_at', today())->count() + 1;
            $orderNumber = sprintf(
                '%s-%s-%04d',
                config('greeva.order_number_prefix'),
                now()->format('Ymd'),
                $count,
            );

            // Buat order
            $order = Order::create([
                'order_number'         => $orderNumber,
                'user_id'              => $user->id,
                'status'               => OrderStatus::PendingPayment,
                'subtotal'             => $subtotal,
                'shipping_total'       => $shippingTotal,
                'shipping_courier'     => $rate->courierName,
                'shipping_service'     => $rate->serviceName,
                'discount_total'       => 0,
                'grand_total'          => $grandTotal,
                'shipping_name'        => $checkoutData['shipping_name'],
                'shipping_phone'       => $checkoutData['shipping_phone'],
                'shipping_address'     => $checkoutData['shipping_address'],
                'shipping_province'    => $checkoutData['shipping_province'],
                'shipping_city'        => $checkoutData['shipping_city'],
                'shipping_district'    => $checkoutData['shipping_district'] ?? null,
                'shipping_postal_code' => $checkoutData['shipping_postal_code'],
                'notes'                => $checkoutData['notes'] ?? null,
                'payment_expired_at'   => now()->addHours(config('greeva.order.payment_expiry_hours')),
            ]);

            // Buat order items dengan snapshot harga & bagi hasil
            foreach ($cartItems as $item) {
                $product             = $products->get($item['product_id']);
                $revenueSharePercent = $product
                    ? $product->revenue_share_percent
                    : config('greeva.revenue_share.default_percent');

                $unitPrice      = $item['price']; // sen
                $qty            = $item['quantity'];
                $itemSubtotal   = $unitPrice * $qty;
                $partnerEarning = Money::percentage($unitPrice, $revenueSharePercent) * $qty;

                $order->items()->create([
                    'product_id'             => $item['product_id'],
                    'product_variant_id'     => $item['variant_id'],
                    'partner_id'             => $item['partner_id'],
                    'product_name'           => $item['product_name'],
                    'variant_name'           => $item['variant_name'],
                    'sku'                    => $item['sku'],
                    'product_image'          => $item['product_image'],
                    'unit_price'             => $unitPrice,
                    'quantity'               => $qty,
                    'subtotal'               => $itemSubtotal,
                    'revenue_share_percent'  => $revenueSharePercent,
                    'partner_earning_amount' => $partnerEarning,
                ]);
            }

            AuditLogger::log('created', $order, [], [
                'order_number' => $order->order_number,
                'grand_total'  => $order->grand_total,
                'item_count'   => count($cartItems),
            ]);

            $this->inventoryService->logSale($order->load('items'), $stockBefore);

            return $order;
        });
    }
}
