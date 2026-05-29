<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use App\Services\Voucher\VoucherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\HttpException;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(VoucherService::class);
    $this->user    = User::factory()->create(['role' => 'buyer']);
});

// ── computeDiscount ──────────────────────────────────────────────────────────

describe('computeDiscount', function () {
    it('menghitung diskon persen', function () {
        $voucher = Voucher::factory()->percent(10)->make();
        // 10% dari Rp 100.000 (10.000.000 sen) = 1.000.000 sen
        expect($this->service->computeDiscount($voucher, 10_000_000))->toBe(1_000_000);
    });

    it('membatasi diskon persen dengan max_discount', function () {
        $voucher = Voucher::factory()->percent(50, maxDiscount: 2_000_000)->make();
        // 50% dari Rp 100.000 = 5.000.000, tapi di-cap ke 2.000.000
        expect($this->service->computeDiscount($voucher, 10_000_000))->toBe(2_000_000);
    });

    it('menghitung diskon nominal tetap', function () {
        $voucher = Voucher::factory()->fixed(5_000_000)->make();
        expect($this->service->computeDiscount($voucher, 10_000_000))->toBe(5_000_000);
    });

    it('membatasi diskon agar tidak melebihi subtotal', function () {
        $voucher = Voucher::factory()->fixed(15_000_000)->make();
        expect($this->service->computeDiscount($voucher, 10_000_000))->toBe(10_000_000);
    });
});

// ── validate ─────────────────────────────────────────────────────────────────

describe('validate', function () {
    it('meloloskan voucher aktif yang valid', function () {
        $voucher = Voucher::factory()->create(['code' => 'HEMAT10']);

        $result = $this->service->validate('hemat10', 10_000_000, $this->user);

        expect($result->id)->toBe($voucher->id);
    });

    it('menolak kode tidak ada / nonaktif', function () {
        Voucher::factory()->inactive()->create(['code' => 'NONAKTIF']);

        expect(fn () => $this->service->validate('TIDAKADA', 10_000_000, $this->user))
            ->toThrow(HttpException::class);
        expect(fn () => $this->service->validate('NONAKTIF', 10_000_000, $this->user))
            ->toThrow(HttpException::class);
    });

    it('menolak voucher kedaluwarsa', function () {
        Voucher::factory()->expired()->create(['code' => 'EXPIRED']);

        expect(fn () => $this->service->validate('EXPIRED', 10_000_000, $this->user))
            ->toThrow(HttpException::class);
    });

    it('menolak jika subtotal di bawah min_purchase', function () {
        Voucher::factory()->create(['code' => 'MIN100', 'min_purchase' => 10_000_000]);

        expect(fn () => $this->service->validate('MIN100', 5_000_000, $this->user))
            ->toThrow(HttpException::class);
    });

    it('menolak jika kuota total habis', function () {
        $voucher = Voucher::factory()->create(['code' => 'KUOTA1', 'usage_limit' => 1]);
        Order::factory()->paid()->create(['voucher_id' => $voucher->id]);

        expect(fn () => $this->service->validate('KUOTA1', 10_000_000, $this->user))
            ->toThrow(HttpException::class);
    });

    it('menolak jika user sudah melebihi per_user_limit', function () {
        $voucher = Voucher::factory()->create(['code' => 'SEKALI', 'per_user_limit' => 1]);
        Order::factory()->paid()->create([
            'voucher_id' => $voucher->id,
            'user_id'    => $this->user->id,
        ]);

        expect(fn () => $this->service->validate('SEKALI', 10_000_000, $this->user))
            ->toThrow(HttpException::class);
    });

    it('menolak first_order_only untuk user yang sudah pernah belanja sukses', function () {
        Voucher::factory()->create(['code' => 'NEWBIE', 'first_order_only' => true]);
        Order::factory()->completed()->create(['user_id' => $this->user->id]);

        expect(fn () => $this->service->validate('NEWBIE', 10_000_000, $this->user))
            ->toThrow(HttpException::class);
    });

    it('meloloskan first_order_only untuk pelanggan baru', function () {
        $voucher = Voucher::factory()->create(['code' => 'NEWBIE2', 'first_order_only' => true]);

        $result = $this->service->validate('NEWBIE2', 10_000_000, $this->user);

        expect($result->id)->toBe($voucher->id);
    });
});
