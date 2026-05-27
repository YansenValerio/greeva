<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Partner;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('mengembalikan produk dari kategori atau mitra yang sama, kecuali dirinya sendiri', function () {
    $category = Category::factory()->create();
    $partner  = Partner::factory()->create();

    $product     = Product::factory()->for($category)->for($partner)->create();
    $sameCat     = Product::factory()->for($category)->create();              // kategori sama, mitra beda
    $samePartner = Product::factory()->for($partner)->create();               // mitra sama, kategori beda
    $unrelated   = Product::factory()->create();                              // tidak terkait
    $inactiveCat = Product::factory()->for($category)->inactive()->create();  // kategori sama tapi nonaktif

    $ids = collect(
        $this->getJson("/api/v1/products/{$product->slug}/related")
            ->assertOk()
            ->json('data')
    )->pluck('id');

    expect($ids)->toContain($sameCat->id)
        ->and($ids)->toContain($samePartner->id)
        ->and($ids)->not->toContain($product->id)      // bukan dirinya sendiri
        ->and($ids)->not->toContain($unrelated->id)    // tidak terkait
        ->and($ids)->not->toContain($inactiveCat->id); // nonaktif tidak muncul
});

it('membatasi jumlah produk serupa maksimal 4', function () {
    $category = Category::factory()->create();
    $product  = Product::factory()->for($category)->create();

    Product::factory()->count(6)->for($category)->create();

    $this->getJson("/api/v1/products/{$product->slug}/related")
        ->assertOk()
        ->assertJsonCount(4, 'data');
});

it('mengembalikan 404 untuk produk yang tidak ada', function () {
    $this->getJson('/api/v1/products/produk-tidak-ada/related')->assertNotFound();
});
