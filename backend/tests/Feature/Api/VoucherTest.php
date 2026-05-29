<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

// ── Admin CRUD ───────────────────────────────────────────────────────────────

describe('Admin voucher CRUD', function () {
    it('membuat voucher baru', function () {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/v1/admin/vouchers', [
            'code'         => 'hemat20',
            'type'         => 'percent',
            'value'        => 20,
            'min_purchase' => 5_000_000,
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.code', 'HEMAT20')   // di-uppercase
            ->assertJsonPath('data.type', 'percent');

        expect(Voucher::where('code', 'HEMAT20')->exists())->toBeTrue();
    });

    it('menolak kode duplikat', function () {
        Sanctum::actingAs(User::factory()->admin()->create());
        Voucher::factory()->create(['code' => 'DOBEL']);

        $this->postJson('/api/v1/admin/vouchers', [
            'code'  => 'DOBEL',
            'type'  => 'fixed',
            'value' => 5_000_000,
        ])->assertStatus(422);
    });

    it('menolak nilai persen di atas 100', function () {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/v1/admin/vouchers', [
            'code'  => 'SALAH',
            'type'  => 'percent',
            'value' => 150,
        ])->assertStatus(422);
    });

    it('memperbarui & menghapus voucher', function () {
        Sanctum::actingAs(User::factory()->admin()->create());
        $voucher = Voucher::factory()->create(['code' => 'EDIT']);

        $this->putJson("/api/v1/admin/vouchers/{$voucher->id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson("/api/v1/admin/vouchers/{$voucher->id}")->assertOk();
        expect(Voucher::find($voucher->id))->toBeNull();
    });

    it('menolak akses non-admin', function () {
        Sanctum::actingAs(User::factory()->create(['role' => UserRole::Buyer]));
        $this->getJson('/api/v1/admin/vouchers')->assertStatus(403);
    });
});

// Catatan: endpoint POST /vouchers/preview bergantung pada CartService (Redis),
// sehingga diuji manual/E2E. Logika inti (validate + computeDiscount) sudah
// dicakup VoucherServiceTest, dan penerapan saat checkout oleh CheckoutServiceTest.
