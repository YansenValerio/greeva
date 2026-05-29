<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

// ── Return request (buyer + admin) ───────────────────────────────────────────

describe('POST /api/v1/orders/{orderNumber}/return', function () {
    it('buyer berhasil mengajukan retur untuk order selesai', function () {
        $buyer = User::factory()->create(['role' => UserRole::Buyer]);
        $order = Order::factory()->completed()->create(['user_id' => $buyer->id]);
        Sanctum::actingAs($buyer);

        $this->postJson("/api/v1/orders/{$order->order_number}/return", [
            'reason'      => 'damaged',
            'description' => 'Produk rusak saat tiba di rumah.',
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.status', 'pending');
    });

    it('menolak deskripsi kurang dari 10 karakter', function () {
        $buyer = User::factory()->create(['role' => UserRole::Buyer]);
        $order = Order::factory()->completed()->create(['user_id' => $buyer->id]);
        Sanctum::actingAs($buyer);

        $this->postJson("/api/v1/orders/{$order->order_number}/return", [
            'reason'      => 'damaged',
            'description' => 'rusak',
        ])->assertStatus(422);
    });
});

describe('PATCH /api/v1/admin/returns/{id}/reject', function () {
    it('wajib menyertakan admin_note', function () {
        $admin  = User::factory()->admin()->create();
        $buyer  = User::factory()->create(['role' => UserRole::Buyer]);
        $order  = Order::factory()->completed()->create(['user_id' => $buyer->id]);
        $return = ReturnRequest::create([
            'return_number' => 'RTN-TEST-0001',
            'order_id'      => $order->id,
            'user_id'       => $buyer->id,
            'reason'        => 'damaged',
            'description'   => 'Produk rusak saat tiba.',
            'status'        => 'pending',
        ]);
        Sanctum::actingAs($admin);

        // Tanpa admin_note → 422
        $this->patchJson("/api/v1/admin/returns/{$return->id}/reject", [])
            ->assertStatus(422);

        // Dengan admin_note → sukses
        $this->patchJson("/api/v1/admin/returns/{$return->id}/reject", [
            'admin_note' => 'Tidak memenuhi syarat retur.',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    });
});

// ── Reports (CSV export) ──────────────────────────────────────────────────────

describe('GET /api/v1/admin/reports/*', function () {
    it('mengunduh CSV penjualan', function () {
        $admin = User::factory()->admin()->create();
        Order::factory()->count(2)->completed()->create();
        Sanctum::actingAs($admin);

        $res = $this->get('/api/v1/admin/reports/sales');
        $res->assertOk();
        expect($res->headers->get('content-type'))->toContain('text/csv');
    });

    it('menolak akses non-admin', function () {
        $buyer = User::factory()->create(['role' => UserRole::Buyer]);
        Sanctum::actingAs($buyer);

        $this->get('/api/v1/admin/reports/sales')->assertStatus(403);
    });
});
