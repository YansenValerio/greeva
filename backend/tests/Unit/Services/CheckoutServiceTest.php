<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\Partner;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Checkout\CheckoutService;
use App\Services\Checkout\StockReservationService;
use App\Services\Payment\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeCheckoutData(): array
{
    return [
        'shipping_name'        => 'Budi Santoso',
        'shipping_phone'       => '081234567890',
        'shipping_address'     => 'Jl. Merdeka No. 1',
        'shipping_province'    => 'Jawa Barat',
        'shipping_city'        => 'Bandung',
        'shipping_postal_code' => '40111',
    ];
}

function makeCartItems(ProductVariant $variant, Product $product, int $qty = 2): array
{
    return [
        [
            'variant_id'   => $variant->id,
            'product_id'   => $product->id,
            'partner_id'   => $product->partner_id,
            'product_name' => $product->name,
            'variant_name' => $variant->name,
            'sku'          => $variant->sku,
            'product_image' => null,
            'price'        => $variant->effectivePrice(),
            'quantity'     => $qty,
        ],
    ];
}

beforeEach(function () {
    $this->midtransMock = $this->mock(MidtransService::class);
    $this->cartMock     = $this->mock(CartService::class);

    // Default: gunakan jalur Midtrans asli (bukan mock-payment dev)
    $this->midtransMock->shouldReceive('isMockMode')->andReturn(false)->byDefault();

    $this->service = app(CheckoutService::class);
});

// ── snapshot & order creation ─────────────────────────────────────────────────

it('creates order with correct snapshot fields', function () {
    $partner  = Partner::factory()->create(['revenue_share_percent' => 80]);
    $category = Category::factory()->create();
    $product  = Product::factory()->for($partner)->for($category)->create([
        'price'                 => 2500000, // Rp 25.000 dalam sen
        'revenue_share_percent' => 80,
    ]);
    $variant = ProductVariant::factory()->for($product)->create([
        'price' => null, // pakai product.price
        'stock' => 10,
    ]);
    $user = User::factory()->state(['role' => 'buyer'])->create();

    $cartItems = makeCartItems($variant, $product, qty: 2);

    $this->cartMock->shouldReceive('getAuthKey')->andReturn("cart:{$user->id}");
    $this->cartMock->shouldReceive('get')->andReturn($cartItems);
    $this->cartMock->shouldReceive('clear')->once();

    $this->midtransMock->shouldReceive('createSnap')->andReturn([
        'token'        => 'snap-test-token',
        'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-test-token',
    ]);

    $result = $this->service->checkout(makeCheckoutData(), $user);

    $order = $result['order'];

    expect($order)->toBeInstanceOf(Order::class)
        ->and($order->status)->toBe(OrderStatus::PendingPayment)
        ->and($order->subtotal)->toBe(5000000)  // 2500000 × 2
        ->and($order->grand_total)->toBe(5000000);

    $item = $order->items->first();

    expect($item->unit_price)->toBe(2500000)
        ->and($item->quantity)->toBe(2)
        ->and($item->subtotal)->toBe(5000000)
        ->and($item->revenue_share_percent)->toBe(80)
        ->and($item->partner_earning_amount)->toBe(4000000); // 2500000×80%×2
});

it('deducts stock on checkout', function () {
    $partner  = Partner::factory()->create();
    $category = Category::factory()->create();
    $product  = Product::factory()->for($partner)->for($category)->create(['price' => 5000000]);
    $variant  = ProductVariant::factory()->for($product)->create(['stock' => 5]);
    $user     = User::factory()->state(['role' => 'buyer'])->create();

    $cartItems = makeCartItems($variant, $product, qty: 3);

    $this->cartMock->shouldReceive('getAuthKey')->andReturn("cart:{$user->id}");
    $this->cartMock->shouldReceive('get')->andReturn($cartItems);
    $this->cartMock->shouldReceive('clear');

    $this->midtransMock->shouldReceive('createSnap')->andReturn([
        'token' => 'tok', 'redirect_url' => 'url',
    ]);

    $this->service->checkout(makeCheckoutData(), $user);

    expect(ProductVariant::find($variant->id)->stock)->toBe(2); // 5 - 3
});

it('rejects checkout when stock is insufficient', function () {
    $partner  = Partner::factory()->create();
    $category = Category::factory()->create();
    $product  = Product::factory()->for($partner)->for($category)->create(['price' => 5000000]);
    $variant  = ProductVariant::factory()->for($product)->create(['stock' => 1]);
    $user     = User::factory()->state(['role' => 'buyer'])->create();

    $cartItems = makeCartItems($variant, $product, qty: 5); // minta 5, stok 1

    $this->cartMock->shouldReceive('getAuthKey')->andReturn("cart:{$user->id}");
    $this->cartMock->shouldReceive('get')->andReturn($cartItems);

    expect(fn () => $this->service->checkout(makeCheckoutData(), $user))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);

    // Stok tidak berubah
    expect(ProductVariant::find($variant->id)->stock)->toBe(1);
});

it('rejects checkout when cart is empty', function () {
    $user = User::factory()->state(['role' => 'buyer'])->create();

    $this->cartMock->shouldReceive('getAuthKey')->andReturn("cart:{$user->id}");
    $this->cartMock->shouldReceive('get')->andReturn([]);

    expect(fn () => $this->service->checkout(makeCheckoutData(), $user))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

it('restores stock and marks order failed if Midtrans throws', function () {
    $partner  = Partner::factory()->create();
    $category = Category::factory()->create();
    $product  = Product::factory()->for($partner)->for($category)->create(['price' => 5000000]);
    $variant  = ProductVariant::factory()->for($product)->create(['stock' => 5]);
    $user     = User::factory()->state(['role' => 'buyer'])->create();

    $cartItems = makeCartItems($variant, $product, qty: 2);

    $this->cartMock->shouldReceive('getAuthKey')->andReturn("cart:{$user->id}");
    $this->cartMock->shouldReceive('get')->andReturn($cartItems);
    $this->cartMock->shouldNotReceive('clear');

    $this->midtransMock->shouldReceive('createSnap')
        ->andThrow(new \RuntimeException('Midtrans error'));

    expect(fn () => $this->service->checkout(makeCheckoutData(), $user))
        ->toThrow(\RuntimeException::class);

    // Stok dikembalikan
    expect(ProductVariant::find($variant->id)->stock)->toBe(5);

    // Order ditandai payment_failed
    $order = Order::latest()->first();
    expect($order->status)->toBe(OrderStatus::PaymentFailed);
});

it('generates unique order number per day', function () {
    $partner  = Partner::factory()->create();
    $category = Category::factory()->create();
    $product  = Product::factory()->for($partner)->for($category)->create(['price' => 5000000]);
    $variant  = ProductVariant::factory()->for($product)->create(['stock' => 20]);
    $user     = User::factory()->state(['role' => 'buyer'])->create();

    $cartItems = makeCartItems($variant, $product, qty: 1);

    $this->midtransMock->shouldReceive('createSnap')->andReturn([
        'token' => 'tok', 'redirect_url' => 'url',
    ]);

    // Buat dua order
    foreach ([1, 2] as $_) {
        $this->cartMock->shouldReceive('getAuthKey')->once()->andReturn("cart:{$user->id}");
        $this->cartMock->shouldReceive('get')->once()->andReturn($cartItems);
        $this->cartMock->shouldReceive('clear')->once();
    }

    $result1 = $this->service->checkout(makeCheckoutData(), $user);
    $result2 = $this->service->checkout(makeCheckoutData(), $user);

    expect($result1['order']->order_number)->not->toBe($result2['order']->order_number);
});
