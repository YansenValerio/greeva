<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Partner;
use App\Models\PartnerEarning;
use App\Models\PayoutBatch;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Analytics\AdminDashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(AdminDashboardService::class);
});

function paidItemForPartner(int $partnerId, array $orderAttrs = [], array $itemAttrs = []): OrderItem
{
    $order = Order::factory()->create(array_merge([
        'status'  => OrderStatus::Paid,
        'paid_at' => now(),
    ], $orderAttrs));

    return OrderItem::factory()->for($order)->create(array_merge([
        'partner_id' => $partnerId,
    ], $itemAttrs));
}

it('computes revenue this month vs last month with change percent', function () {
    Order::factory()->create([
        'status'      => OrderStatus::Paid,
        'paid_at'     => now(),
        'grand_total' => 10_000_000,
    ]);
    Order::factory()->create([
        'status'      => OrderStatus::Completed,
        'paid_at'     => now()->subMonth(),
        'grand_total' => 5_000_000,
    ]);
    // Order belum dibayar — diabaikan
    Order::factory()->create(['status' => OrderStatus::PendingPayment, 'grand_total' => 9_000_000]);

    $revenue = $this->service->overview()['revenue'];

    expect($revenue['this_month'])->toBe(10_000_000)
        ->and($revenue['last_month'])->toBe(5_000_000)
        ->and($revenue['change_percent'])->toBe(100.0)
        ->and($revenue['monthly_trend'])->toHaveCount(6);
});

it('counts orders needing fulfillment and pending payment', function () {
    Order::factory()->create(['status' => OrderStatus::Paid, 'paid_at' => now()]);
    Order::factory()->create(['status' => OrderStatus::Packing, 'paid_at' => now()]);
    Order::factory()->create(['status' => OrderStatus::Shipped, 'paid_at' => now()]); // tidak dihitung
    Order::factory()->create(['status' => OrderStatus::PendingPayment]);
    Order::factory()->create(['status' => OrderStatus::PendingPayment]);

    $orders = $this->service->overview()['orders'];

    expect($orders['needs_fulfillment'])->toBe(2)
        ->and($orders['pending_payment'])->toBe(2);
});

it('summarizes pending payouts and available earnings owed', function () {
    $partner = Partner::factory()->create();
    PayoutBatch::factory()->for($partner)->create([
        'status'       => \App\Enums\PayoutStatus::Pending,
        'total_amount' => 3_000_000,
    ]);
    PayoutBatch::factory()->for($partner)->create([
        'status'       => \App\Enums\PayoutStatus::Paid,
        'total_amount' => 9_000_000, // tidak dihitung
    ]);
    PartnerEarning::factory()->for($partner)->available()->create(['amount' => 1_500_000]);
    PartnerEarning::factory()->for($partner)->create(['amount' => 999]); // pending, tidak dihitung

    $payouts = $this->service->overview()['payouts'];

    expect($payouts['pending_batches'])->toBe(1)
        ->and($payouts['pending_amount'])->toBe(3_000_000)
        ->and($payouts['available_earnings'])->toBe(1_500_000);
});

it('ranks top partners by gross sales', function () {
    $a = Partner::factory()->create(['name' => 'Notic']);
    $b = Partner::factory()->create(['name' => 'Reperca']);

    paidItemForPartner($a->id, itemAttrs: ['subtotal' => 2_000_000, 'quantity' => 2]);
    paidItemForPartner($b->id, itemAttrs: ['subtotal' => 8_000_000, 'quantity' => 4]);

    $top = $this->service->overview()['top_partners'];

    expect($top)->toHaveCount(2)
        ->and($top[0]['name'])->toBe('Reperca')
        ->and($top[0]['gross_sales'])->toBe(8_000_000)
        ->and($top[1]['name'])->toBe('Notic');
});

it('ranks top categories by gross sales', function () {
    $partner = Partner::factory()->create();
    $catA    = Category::factory()->create(['name' => 'Aksesoris']);
    $catB    = Category::factory()->create(['name' => 'Tas']);
    $prodA   = Product::factory()->for($partner)->for($catA)->create();
    $prodB   = Product::factory()->for($partner)->for($catB)->create();

    paidItemForPartner($partner->id, itemAttrs: ['product_id' => $prodA->id, 'subtotal' => 1_000_000]);
    paidItemForPartner($partner->id, itemAttrs: ['product_id' => $prodB->id, 'subtotal' => 6_000_000]);

    $top = $this->service->overview()['top_categories'];

    expect($top)->toHaveCount(2)
        ->and($top[0]['name'])->toBe('Tas')
        ->and($top[0]['gross_sales'])->toBe(6_000_000);
});

it('lists low stock active variants across partners', function () {
    $partner = Partner::factory()->create();
    $product = Product::factory()->for($partner)->for(Category::factory())
        ->create(['status' => \App\Enums\ProductStatus::Active]);

    ProductVariant::factory()->for($product)->create(['stock' => 2, 'is_active' => true]);
    ProductVariant::factory()->for($product)->create(['stock' => 50, 'is_active' => true]); // cukup
    ProductVariant::factory()->for($product)->create(['stock' => 1, 'is_active' => false]); // nonaktif

    $low = $this->service->overview()['low_stock'];

    expect($low)->toHaveCount(1)
        ->and($low[0]['stock'])->toBe(2)
        ->and($low[0]['partner_name'])->toBe($partner->name);
});
