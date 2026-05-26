<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\Partner;
use App\Models\Product;
use App\Services\Order\OrderService;
use App\Services\Product\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->productService = app(ProductService::class);
    $this->orderService   = app(OrderService::class);
    $this->partner        = Partner::factory()->create();
    $this->category       = Category::factory()->create();
});

it('bulk activates multiple products and sets published_at', function () {
    $products = Product::factory()->count(3)->for($this->partner)->for($this->category)
        ->create(['status' => ProductStatus::PendingReview, 'published_at' => null]);

    $count = $this->productService->bulkUpdateStatus(
        $products->pluck('id')->all(),
        ProductStatus::Active,
    );

    expect($count)->toBe(3);
    $products->each(function ($p) {
        $fresh = $p->fresh();
        expect($fresh->status)->toBe(ProductStatus::Active)
            ->and($fresh->published_at)->not->toBeNull();
    });
});

it('bulk transitions valid orders and reports invalid ones', function () {
    $payable     = Order::factory()->create(['status' => OrderStatus::Paid, 'paid_at' => now()]);
    $alsoPayable = Order::factory()->create(['status' => OrderStatus::Paid, 'paid_at' => now()]);
    // shipped tidak bisa transisi ke packing → harus gagal
    $invalid     = Order::factory()->create(['status' => OrderStatus::Shipped, 'paid_at' => now()]);

    $result = $this->orderService->bulkUpdateStatus(
        [$payable->id, $alsoPayable->id, $invalid->id],
        OrderStatus::Packing,
    );

    expect($result['updated'])->toHaveCount(2)
        ->and($result['failed'])->toHaveCount(1)
        ->and($result['failed'][0]['order_number'])->toBe($invalid->order_number);

    expect($payable->fresh()->status)->toBe(OrderStatus::Packing)
        ->and($invalid->fresh()->status)->toBe(OrderStatus::Shipped);
});

it('bulk product status update is atomic per call', function () {
    $products = Product::factory()->count(2)->for($this->partner)->for($this->category)
        ->create(['status' => ProductStatus::Active]);

    $count = $this->productService->bulkUpdateStatus(
        $products->pluck('id')->all(),
        ProductStatus::Inactive,
    );

    expect($count)->toBe(2);
    $products->each(fn ($p) => expect($p->fresh()->status)->toBe(ProductStatus::Inactive));
});
