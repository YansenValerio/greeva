<?php

declare(strict_types=1);

use App\Enums\ProductStatus;
use App\Models\Partner;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Product\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(ProductService::class);

    $this->partner = Partner::factory()->create([
        'revenue_share_percent' => 80,
    ]);
});

// ── create ───────────────────────────────────────────────────────────────────

it('creates a product with draft status and inherits partner revenue share', function () {
    $category = \App\Models\Category::factory()->create();

    $product = $this->service->create([
        'name'        => 'Gelang Manik HDPE',
        'description' => 'Gelang dari plastik HDPE daur ulang.',
        'price'       => 2500000, // Rp 25.000 dalam sen
        'weight'      => 30,
        'category_id' => $category->id,
    ], $this->partner);

    expect($product->status)->toBe(ProductStatus::Draft)
        ->and($product->partner_id)->toBe($this->partner->id)
        ->and($product->revenue_share_percent)->toBe(80)
        ->and($product->slug)->toBe('gelang-manik-hdpe');
});

it('generates unique slug when name is duplicate', function () {
    $category = \App\Models\Category::factory()->create();

    $data = [
        'name'        => 'Tote Bag Perca',
        'description' => 'Tote bag dari kain perca.',
        'price'       => 5000000,
        'weight'      => 200,
        'category_id' => $category->id,
    ];

    $first  = $this->service->create($data, $this->partner);
    $second = $this->service->create($data, $this->partner);

    expect($first->slug)->toBe('tote-bag-perca')
        ->and($second->slug)->toBe('tote-bag-perca-1');
});

// ── submitForReview ──────────────────────────────────────────────────────────

it('transitions product from draft to pending_review on submit', function () {
    $product = Product::factory()->for($this->partner)->create([
        'status' => ProductStatus::Draft,
    ]);

    $updated = $this->service->submitForReview($product);

    expect($updated->status)->toBe(ProductStatus::PendingReview);
});

it('rejects submit when product is not in draft', function () {
    $product = Product::factory()->for($this->partner)->create([
        'status' => ProductStatus::Active,
    ]);

    expect(fn () => $this->service->submitForReview($product))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

// ── updateStatus ─────────────────────────────────────────────────────────────

it('sets published_at when status first changes to active', function () {
    $product = Product::factory()->for($this->partner)->create([
        'status'       => ProductStatus::PendingReview,
        'published_at' => null,
    ]);

    $updated = $this->service->updateStatus($product, ProductStatus::Active);

    expect($updated->published_at)->not->toBeNull();
});

it('does not overwrite published_at on subsequent activations', function () {
    $originalDate = now()->subDays(5);

    $product = Product::factory()->for($this->partner)->create([
        'status'       => ProductStatus::Inactive,
        'published_at' => $originalDate,
    ]);

    $updated = $this->service->updateStatus($product, ProductStatus::Active);

    expect($updated->published_at->toDateString())->toBe($originalDate->toDateString());
});

// ── variants ─────────────────────────────────────────────────────────────────

it('adds a variant to a product', function () {
    $product = Product::factory()->for($this->partner)->create();

    $variant = $this->service->addVariant($product, [
        'sku'    => 'NTC-001-RED',
        'name'   => 'Merah',
        'stock'  => 10,
        'price'  => null,
    ]);

    expect($variant->product_id)->toBe($product->id)
        ->and($variant->sku)->toBe('NTC-001-RED')
        ->and($variant->stock)->toBe(10);
});

it('soft-deletes a variant', function () {
    $product = Product::factory()->for($this->partner)->create();
    $variant = ProductVariant::factory()->for($product)->create();

    $this->service->deleteVariant($variant);

    expect(ProductVariant::find($variant->id))->toBeNull()
        ->and(ProductVariant::withTrashed()->find($variant->id))->not->toBeNull();
});

// ── delete ───────────────────────────────────────────────────────────────────

it('soft-deletes a product', function () {
    $product = Product::factory()->for($this->partner)->create();

    $this->service->delete($product);

    expect(Product::find($product->id))->toBeNull()
        ->and(Product::withTrashed()->find($product->id))->not->toBeNull();
});
