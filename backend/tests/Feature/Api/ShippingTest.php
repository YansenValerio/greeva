<?php

declare(strict_types=1);

use App\Models\Product;
use App\Services\Shipping\ShippingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('shipping.provider', 'mock');
    config()->set('shipping.weight', ['default_per_item' => 250, 'minimum' => 1000]);
    config()->set('shipping.mock.services', [[
        'courier_code' => 'jne',
        'courier_name' => 'JNE',
        'service_code' => 'REG',
        'service_name' => 'Reguler',
        'etd'          => '2-3 hari',
        'base'         => 1000000,   // Rp 10.000
        'per_extra_kg' => 500000,    // Rp 5.000 / kg
    ], [
        'courier_code' => 'sicepat',
        'courier_name' => 'SiCepat',
        'service_code' => 'BEST',
        'service_name' => 'Express',
        'etd'          => '1-2 hari',
        'base'         => 1600000,
        'per_extra_kg' => 800000,
    ]]);
});

function cartItem(int $productId, int $qty): array
{
    return ['product_id' => $productId, 'quantity' => $qty];
}

it('menjumlahkan berat isi cart dan menerapkan minimum', function () {
    $a = Product::factory()->create(['weight' => 300]);
    $b = Product::factory()->create(['weight' => 200]);

    $service = app(ShippingService::class);

    // 300*2 + 200*1 = 800g → di bawah minimum 1000 → jadi 1000
    expect($service->totalWeight([cartItem($a->id, 2), cartItem($b->id, 1)]))->toBe(1000);

    // 300*4 = 1200g → di atas minimum
    expect($service->totalWeight([cartItem($a->id, 4)]))->toBe(1200);
});

it('produk tanpa berat memakai default per item', function () {
    $p = Product::factory()->create(['weight' => 0]);
    $service = app(ShippingService::class);

    // 0 → default 250 * 5 = 1250g
    expect($service->totalWeight([cartItem($p->id, 5)]))->toBe(1250);
});

it('mock provider menghitung tarif berbasis kilogram (dalam sen)', function () {
    $p = Product::factory()->create(['weight' => 1500]); // 1.5kg → ceil = 2kg
    $service = app(ShippingService::class);

    $rates = $service->ratesForCart([cartItem($p->id, 1)], '40111');

    expect($rates)->toHaveCount(2);
    // JNE: 1.000.000 + (2-1)*500.000 = 1.500.000 sen (Rp 15.000)
    expect($rates[0]->courierCode)->toBe('jne')
        ->and($rates[0]->cost)->toBe(1500000)
        // SiCepat: 1.600.000 + 800.000 = 2.400.000 sen
        ->and($rates[1]->cost)->toBe(2400000);
});

it('resolveRate mencocokkan kurir+layanan dan menolak yang tidak dikenal', function () {
    $p = Product::factory()->create(['weight' => 500]);
    $service = app(ShippingService::class);
    $items = [cartItem($p->id, 1)];

    $rate = $service->resolveRate($items, '40111', 'jne', 'REG');
    expect($rate)->not->toBeNull()
        ->and($rate->cost)->toBe(1000000) // 500g → min 1kg → base
        ->and($rate->courierName)->toBe('JNE');

    expect($service->resolveRate($items, '40111', 'gojek', 'INSTANT'))->toBeNull();
});
