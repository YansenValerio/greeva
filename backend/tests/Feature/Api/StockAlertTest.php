<?php

declare(strict_types=1);

use App\Events\ProductRestocked;
use App\Listeners\SendStockAlertNotifications;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockAlert;
use App\Services\Notification\WhatsAppService;
use App\Services\Product\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

describe('POST /api/v1/stock-alerts', function () {
    it('mendaftarkan notifikasi untuk varian yang habis', function () {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 0]);

        $this->postJson('/api/v1/stock-alerts', [
            'product_variant_id' => $variant->id,
            'phone'              => '081234567890',
            'email'              => 'buyer@example.com',
        ])->assertStatus(201);

        expect(StockAlert::where('product_variant_id', $variant->id)
            ->where('phone', '081234567890')
            ->whereNull('notified_at')
            ->exists())->toBeTrue();
    });

    it('menolak jika varian masih ada stok', function () {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 5]);

        $this->postJson('/api/v1/stock-alerts', [
            'product_variant_id' => $variant->id,
            'phone'              => '081234567890',
        ])->assertStatus(422);

        expect(StockAlert::count())->toBe(0);
    });

    it('idempotent — telepon sama tidak menggandakan langganan', function () {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 0]);

        $payload = ['product_variant_id' => $variant->id, 'phone' => '081234567890'];
        $this->postJson('/api/v1/stock-alerts', $payload)->assertStatus(201);
        $this->postJson('/api/v1/stock-alerts', $payload)->assertStatus(201);

        expect(StockAlert::where('product_variant_id', $variant->id)->count())->toBe(1);
    });
});

describe('trigger restock', function () {
    it('mengirim event ProductRestocked saat stok 0 menjadi tersedia', function () {
        Event::fake([ProductRestocked::class]);

        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 0]);

        app(ProductService::class)->updateVariant($variant, ['stock' => 10]);

        Event::assertDispatched(ProductRestocked::class);
    });

    it('tidak mengirim event jika stok tidak dari nol', function () {
        Event::fake([ProductRestocked::class]);

        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 5]);

        app(ProductService::class)->updateVariant($variant, ['stock' => 3]);

        Event::assertNotDispatched(ProductRestocked::class);
    });
});

describe('listener notifikasi', function () {
    it('mengirim WA ke subscriber pending dan menandai notified_at', function () {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create(['stock' => 8]);

        $pendingA = StockAlert::create(['product_variant_id' => $variant->id, 'phone' => '0811']);
        $pendingB = StockAlert::create(['product_variant_id' => $variant->id, 'phone' => '0822']);
        $already  = StockAlert::create([
            'product_variant_id' => $variant->id,
            'phone'              => '0833',
            'notified_at'        => now()->subDay(),
        ]);

        $wa = $this->mock(WhatsAppService::class);
        $wa->shouldReceive('send')->twice(); // hanya 2 yang pending

        app(SendStockAlertNotifications::class)->handle(new ProductRestocked($variant));

        expect($pendingA->fresh()->notified_at)->not->toBeNull()
            ->and($pendingB->fresh()->notified_at)->not->toBeNull()
            ->and($already->fresh()->notified_at->toDateString())->toBe(now()->subDay()->toDateString());
    });
});
