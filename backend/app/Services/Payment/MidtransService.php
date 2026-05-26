<?php

declare(strict_types=1);

namespace App\Services\Payment;

use App\Models\Order;
use App\Support\Money;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = (bool) config('services.midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    /**
     * Buat Snap transaction dan kembalikan token + redirect URL.
     *
     * @return array{token: string, redirect_url: string}
     */
    public function isMockMode(): bool
    {
        return empty(config('services.midtrans.server_key'));
    }

    public function createMockSnap(Order $order): array
    {
        return [
            'token'        => 'GREEVA_MOCK_' . $order->order_number,
            'redirect_url' => '',
        ];
    }

    public function createSnap(Order $order): array
    {
        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                // Midtrans menerima Rupiah (bukan sen)
                'gross_amount' => Money::toRupiah($order->grand_total),
            ],
            'customer_details' => [
                'first_name' => $order->shipping_name,
                'phone'      => $order->shipping_phone,
                'email'      => $order->user?->email ?? $order->guest_email ?? 'customer@greeva.id',
            ],
            'item_details' => $this->buildItemDetails($order),
            'expiry' => [
                'start_time' => now()->format('Y-m-d H:i:s O'),
                'unit'       => 'hours',
                'duration'   => config('greeva.order.payment_expiry_hours'),
            ],
        ];

        $snap = Snap::createTransaction($params);

        return [
            'token'        => $snap->token,
            'redirect_url' => $snap->redirect_url,
        ];
    }

    /**
     * Verifikasi signature dari webhook Midtrans.
     */
    public function verifyWebhook(array $notification): bool
    {
        $expected = hash('sha512',
            $notification['order_id']
            . $notification['status_code']
            . $notification['gross_amount']
            . config('services.midtrans.server_key')
        );

        return hash_equals($expected, $notification['signature_key'] ?? '');
    }

    /**
     * Tentukan apakah notifikasi berarti pembayaran berhasil.
     */
    public function isPaymentSuccess(array $notification): bool
    {
        $status      = $notification['transaction_status'] ?? '';
        $fraudStatus = $notification['fraud_status'] ?? 'accept';

        return $status === 'settlement'
            || ($status === 'capture' && $fraudStatus === 'accept');
    }

    /**
     * Tentukan apakah notifikasi berarti pembayaran gagal/expire.
     */
    public function isPaymentFailed(array $notification): bool
    {
        return in_array(
            $notification['transaction_status'] ?? '',
            ['cancel', 'deny', 'expire'],
            strict: true,
        );
    }

    private function buildItemDetails(Order $order): array
    {
        $items = [];

        foreach ($order->items as $item) {
            $name = $item->product_name;
            if ($item->variant_name) {
                $name .= " - {$item->variant_name}";
            }

            $items[] = [
                'id'       => (string) $item->id,
                'price'    => Money::toRupiah($item->unit_price),
                'quantity' => $item->quantity,
                'name'     => mb_substr($name, 0, 50), // Midtrans max 50 chars
            ];
        }

        // Tambah shipping jika ada
        if ($order->shipping_total > 0) {
            $items[] = [
                'id'       => 'SHIPPING',
                'price'    => Money::toRupiah($order->shipping_total),
                'quantity' => 1,
                'name'     => 'Ongkos Kirim',
            ];
        }

        return $items;
    }
}
