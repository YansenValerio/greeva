<?php

declare(strict_types=1);

use App\Enums\EarningStatus;
use App\Enums\UserRole;
use App\Models\AppNotification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Partner;
use App\Models\PartnerEarning;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

// ── Suspend user ──────────────────────────────────────────────────────────────

describe('PATCH /api/v1/admin/users/{user}/suspend', function () {
    it('men-toggle status suspend buyer', function () {
        $admin = User::factory()->admin()->create();
        $buyer = User::factory()->create(['role' => UserRole::Buyer]);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/users/{$buyer->id}/suspend")
            ->assertOk()
            ->assertJsonPath('data.is_suspended', true);

        expect($buyer->fresh()->is_suspended)->toBeTrue();

        // Toggle balik
        $this->patchJson("/api/v1/admin/users/{$buyer->id}/suspend")
            ->assertOk()
            ->assertJsonPath('data.is_suspended', false);
    });

    it('menolak suspend akun admin', function () {
        $admin       = User::factory()->admin()->create();
        $otherAdmin  = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/users/{$otherAdmin->id}/suspend")
            ->assertStatus(422);
    });

    it('memblokir akses user yang disuspend', function () {
        $buyer = User::factory()->create(['role' => UserRole::Buyer, 'is_suspended' => true]);
        Sanctum::actingAs($buyer);

        // Endpoint ber-middleware role akan menolak user tersuspend
        $this->getJson('/api/v1/orders')->assertStatus(403);
    });
});

// ── Reverse earning ─────────────────────────────────────────────────────────

describe('PATCH /api/v1/admin/earnings/{earning}/reverse', function () {
    it('membatalkan earning available dengan alasan', function () {
        $admin   = User::factory()->admin()->create();
        $earning = PartnerEarning::factory()->available()->create();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/earnings/{$earning->id}/reverse", [
            'reason' => 'Dispute mitra disetujui.',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'reversed');

        expect($earning->fresh()->status)->toBe(EarningStatus::Reversed);
    });

    it('menolak tanpa alasan', function () {
        $admin   = User::factory()->admin()->create();
        $earning = PartnerEarning::factory()->available()->create();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/earnings/{$earning->id}/reverse", [])
            ->assertStatus(422);
    });

    it('menolak reverse earning yang sudah paid', function () {
        $admin   = User::factory()->admin()->create();
        $earning = PartnerEarning::factory()->paid()->create();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/earnings/{$earning->id}/reverse", [
            'reason' => 'coba reverse',
        ])->assertStatus(422);
    });
});

// ── Toggle featured ───────────────────────────────────────────────────────────

describe('PATCH /api/v1/admin/products/{product}/toggle-featured', function () {
    it('men-toggle status pilihan produk', function () {
        $admin   = User::factory()->admin()->create();
        $product = Product::factory()->create(['is_featured' => false]);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/products/{$product->id}/toggle-featured")
            ->assertOk()
            ->assertJsonPath('data.is_featured', true);

        expect($product->fresh()->is_featured)->toBeTrue();
    });
});

// ── Partner orders ─────────────────────────────────────────────────────────

describe('GET /api/v1/partner/orders', function () {
    it('hanya menampilkan order yang memuat produk mitra ini, tanpa PII buyer', function () {
        $partner = Partner::factory()->create();

        $myOrder = Order::factory()->paid()->create();
        OrderItem::factory()->for($myOrder)->for($partner)->create();

        // Order mitra lain — tidak boleh muncul
        $otherOrder = Order::factory()->paid()->create();
        OrderItem::factory()->for($otherOrder)->create();

        Sanctum::actingAs($partner->user);

        $res = $this->getJson('/api/v1/partner/orders')->assertOk();

        $res->assertJsonCount(1, 'data');
        $res->assertJsonPath('data.0.order_number', $myOrder->order_number);

        // Pastikan tidak ada field PII buyer
        $json = $res->json('data.0');
        expect($json)->not->toHaveKeys(['shipping_name', 'shipping_phone', 'shipping_address', 'user_id']);
    });
});

// ── Notifications ─────────────────────────────────────────────────────────

describe('Notifications', function () {
    it('menampilkan notifikasi & unread count milik user', function () {
        $user = User::factory()->create(['role' => UserRole::Buyer]);
        AppNotification::create([
            'user_id' => $user->id, 'type' => 'test', 'title' => 'Halo', 'body' => 'Pesan uji',
        ]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('count', 1);
    });

    it('menandai satu notifikasi sebagai sudah dibaca', function () {
        $user = User::factory()->create(['role' => UserRole::Buyer]);
        $notif = AppNotification::create([
            'user_id' => $user->id, 'type' => 'test', 'title' => 'Halo', 'body' => 'Pesan uji',
        ]);
        Sanctum::actingAs($user);

        $this->patchJson("/api/v1/notifications/{$notif->id}/read")->assertOk();

        expect($notif->fresh()->read_at)->not->toBeNull();
    });

    it('menolak menandai notifikasi milik user lain', function () {
        $user  = User::factory()->create(['role' => UserRole::Buyer]);
        $other = User::factory()->create(['role' => UserRole::Buyer]);
        $notif = AppNotification::create([
            'user_id' => $other->id, 'type' => 'test', 'title' => 'X', 'body' => 'Y',
        ]);
        Sanctum::actingAs($user);

        $this->patchJson("/api/v1/notifications/{$notif->id}/read")->assertStatus(403);
    });

    it('menandai semua notifikasi sebagai dibaca', function () {
        $user = User::factory()->create(['role' => UserRole::Buyer]);
        AppNotification::create(['user_id' => $user->id, 'type' => 't', 'title' => 'A', 'body' => 'a']);
        AppNotification::create(['user_id' => $user->id, 'type' => 't', 'title' => 'B', 'body' => 'b']);
        Sanctum::actingAs($user);

        $this->patchJson('/api/v1/notifications/read-all')->assertOk();

        expect(AppNotification::where('user_id', $user->id)->whereNull('read_at')->count())->toBe(0);
    });
});
