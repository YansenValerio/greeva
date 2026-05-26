<?php

declare(strict_types=1);

use App\Enums\InventoryReason;
use App\Models\Category;
use App\Models\InventoryLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Partner;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Inventory\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service  = app(InventoryService::class);
    $this->partner  = Partner::factory()->create();
    $this->category = Category::factory()->create();
    $this->product  = Product::factory()->for($this->partner)->for($this->category)->create();
});

it('logs a sale with negative change and snapshot stock', function () {
    $variant = ProductVariant::factory()->for($this->product)->create(['stock' => 8]);
    $order   = Order::factory()->create();
    OrderItem::factory()->for($order)->create([
        'partner_id'         => $this->partner->id,
        'product_id'         => $this->product->id,
        'product_variant_id' => $variant->id,
        'quantity'           => 2,
    ]);

    $this->service->logSale($order->load('items'), [$variant->id => 10]);

    $log = InventoryLog::firstOrFail();
    expect($log->change)->toBe(-2)
        ->and($log->stock_before)->toBe(10)
        ->and($log->stock_after)->toBe(8)
        ->and($log->reason)->toBe(InventoryReason::Sale)
        ->and($log->order_id)->toBe($order->id)
        ->and($log->partner_id)->toBe($this->partner->id);
});

it('logs a release with positive change derived from current stock', function () {
    $variant = ProductVariant::factory()->for($this->product)->create(['stock' => 10]);
    $order   = Order::factory()->create();
    OrderItem::factory()->for($order)->create([
        'partner_id'         => $this->partner->id,
        'product_id'         => $this->product->id,
        'product_variant_id' => $variant->id,
        'quantity'           => 3,
    ]);

    $this->service->logRelease($order);

    $log = InventoryLog::firstOrFail();
    expect($log->change)->toBe(3)
        ->and($log->stock_before)->toBe(7)
        ->and($log->stock_after)->toBe(10)
        ->and($log->reason)->toBe(InventoryReason::Release);
});

it('logs a manual adjustment', function () {
    $variant = ProductVariant::factory()->for($this->product)->create(['stock' => 12]);

    $this->service->logManualAdjustment($variant, 5, 12, 'restock mingguan');

    $log = InventoryLog::firstOrFail();
    expect($log->change)->toBe(7)
        ->and($log->stock_before)->toBe(5)
        ->and($log->stock_after)->toBe(12)
        ->and($log->reason)->toBe(InventoryReason::Adjustment)
        ->and($log->note)->toBe('restock mingguan')
        ->and($log->order_id)->toBeNull();
});

it('does not log when manual adjustment leaves stock unchanged', function () {
    $variant = ProductVariant::factory()->for($this->product)->create(['stock' => 5]);

    $this->service->logManualAdjustment($variant, 5, 5);

    expect(InventoryLog::count())->toBe(0);
});

it('logs initial stock for a new variant', function () {
    $variant = ProductVariant::factory()->for($this->product)->create(['stock' => 20]);

    $this->service->logInitialStock($variant);

    $log = InventoryLog::firstOrFail();
    expect($log->change)->toBe(20)
        ->and($log->stock_before)->toBe(0)
        ->and($log->stock_after)->toBe(20)
        ->and($log->reason)->toBe(InventoryReason::Initial);
});

it('does not log initial stock when variant starts empty', function () {
    $variant = ProductVariant::factory()->for($this->product)->create(['stock' => 0]);

    $this->service->logInitialStock($variant);

    expect(InventoryLog::count())->toBe(0);
});
