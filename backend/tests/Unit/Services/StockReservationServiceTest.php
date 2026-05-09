<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Partner;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Checkout\StockReservationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service  = app(StockReservationService::class);
    $this->partner  = Partner::factory()->create();
    $this->category = Category::factory()->create();
    $this->product  = Product::factory()->for($this->partner)->for($this->category)->create();
});

it('deducts stock', function () {
    $variant = ProductVariant::factory()->for($this->product)->create(['stock' => 10]);

    $this->service->reserve([['variant_id' => $variant->id, 'quantity' => 3]]);

    expect(ProductVariant::find($variant->id)->stock)->toBe(7);
});

it('restores stock on release', function () {
    $variant = ProductVariant::factory()->for($this->product)->create(['stock' => 7]);

    $this->service->release([['variant_id' => $variant->id, 'quantity' => 3]]);

    expect(ProductVariant::find($variant->id)->stock)->toBe(10);
});

it('handles multiple variants in one call', function () {
    $v1 = ProductVariant::factory()->for($this->product)->create(['stock' => 5]);
    $v2 = ProductVariant::factory()->for($this->product)->create(['stock' => 8]);

    $this->service->reserve([
        ['variant_id' => $v1->id, 'quantity' => 2],
        ['variant_id' => $v2->id, 'quantity' => 3],
    ]);

    expect(ProductVariant::find($v1->id)->stock)->toBe(3)
        ->and(ProductVariant::find($v2->id)->stock)->toBe(5);
});
