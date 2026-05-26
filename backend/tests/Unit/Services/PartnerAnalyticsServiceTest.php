<?php

declare(strict_types=1);

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Partner;
use App\Models\PartnerEarning;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Analytics\PartnerAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service  = app(PartnerAnalyticsService::class);
    $this->partner  = Partner::factory()->create();
    $this->category = Category::factory()->create();
});

function paidOrderItem(int $partnerId, int $productId, array $attrs = []): OrderItem
{
    $order = Order::factory()->paid()->create();

    return OrderItem::factory()->for($order)->create(array_merge([
        'partner_id' => $partnerId,
        'product_id' => $productId,
    ], $attrs));
}

it('aggregates summary only from paid orders of the partner', function () {
    $product = Product::factory()->for($this->partner)->for($this->category)
        ->create(['status' => ProductStatus::Active]);
    ProductVariant::factory()->for($product)->create(['stock' => 3]); // low stock

    paidOrderItem($this->partner->id, $product->id, [
        'quantity' => 2,
        'subtotal' => 2_000_000,
    ]);

    // Pending order — harus diabaikan
    $pending = Order::factory()->create(); // default pending_payment
    OrderItem::factory()->for($pending)->create([
        'partner_id' => $this->partner->id,
        'product_id' => $product->id,
        'quantity'   => 9,
        'subtotal'   => 9_000_000,
    ]);

    // Mitra lain — harus diabaikan
    $otherPartner = Partner::factory()->create();
    paidOrderItem($otherPartner->id, $product->id, ['quantity' => 5, 'subtotal' => 5_000_000]);

    PartnerEarning::factory()->for($this->partner)->create(['amount' => 1_600_000]);

    $summary = $this->service->overview($this->partner)['summary'];

    expect($summary['units_sold'])->toBe(2)
        ->and($summary['gross_sales'])->toBe(2_000_000)
        ->and($summary['total_orders'])->toBe(1)
        ->and($summary['active_products'])->toBe(1)
        ->and($summary['low_stock_variants'])->toBe(1)
        ->and($summary['total_earnings'])->toBe(1_600_000);
});

it('excludes reversed earnings from total earnings', function () {
    PartnerEarning::factory()->for($this->partner)->create(['amount' => 1_000_000]);
    PartnerEarning::factory()->for($this->partner)->reversed()->create(['amount' => 500_000]);

    $summary = $this->service->overview($this->partner)['summary'];

    expect($summary['total_earnings'])->toBe(1_000_000);
});

it('ranks top products by units sold', function () {
    $productA = Product::factory()->for($this->partner)->for($this->category)->create();
    $productB = Product::factory()->for($this->partner)->for($this->category)->create();

    paidOrderItem($this->partner->id, $productA->id, [
        'product_name' => 'Produk A',
        'quantity'     => 3,
        'subtotal'     => 3_000_000,
    ]);
    paidOrderItem($this->partner->id, $productB->id, [
        'product_name' => 'Produk B',
        'quantity'     => 10,
        'subtotal'     => 10_000_000,
    ]);

    $top = $this->service->overview($this->partner)['top_products'];

    expect($top)->toHaveCount(2)
        ->and($top[0]['name'])->toBe('Produk B')
        ->and($top[0]['units_sold'])->toBe(10)
        ->and($top[1]['name'])->toBe('Produk A');
});

it('returns a six-month trend skeleton even without sales', function () {
    $trend = $this->service->overview($this->partner)['monthly_trend'];

    expect($trend)->toHaveCount(6)
        ->and($trend[0])->toHaveKeys(['month', 'units_sold', 'gross_sales', 'orders'])
        ->and(collect($trend)->sum('units_sold'))->toBe(0);
});
