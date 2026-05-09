<?php

declare(strict_types=1);

use App\Enums\EarningStatus;
use App\Enums\PayoutStatus;
use App\Models\Partner;
use App\Models\PartnerEarning;
use App\Models\PayoutBatch;
use App\Models\User;
use Carbon\Carbon;
use App\Services\Payout\PayoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\HttpException;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(PayoutService::class);
    $this->partner = Partner::factory()->create();
    $this->admin   = User::factory()->admin()->create();
});

// ── generate ─────────────────────────────────────────────────────────────────

describe('generate', function () {
    it('membuat batch dengan semua available earnings', function () {
        $earnings = PartnerEarning::factory()
            ->count(3)
            ->for($this->partner)
            ->available()
            ->create();

        $batch = $this->service->generate(
            $this->partner, $this->admin, [],
            now()->subDays(15), now(),
        );

        expect($batch)->toBeInstanceOf(PayoutBatch::class)
            ->and($batch->status)->toBe(PayoutStatus::Pending)
            ->and($batch->partner_id)->toBe($this->partner->id)
            ->and($batch->item_count)->toBe(3)
            ->and($batch->total_amount)->toBe((int) $earnings->sum('amount'));

        expect(PartnerEarning::where('payout_batch_id', $batch->id)->count())->toBe(3);
        expect($batch->payout_number)->toStartWith('PYT-');
    });

    it('hanya menyertakan earning_ids yang diminta', function () {
        $e1 = PartnerEarning::factory()->for($this->partner)->available()->create();
        $e2 = PartnerEarning::factory()->for($this->partner)->available()->create();
        $e3 = PartnerEarning::factory()->for($this->partner)->available()->create();

        $batch = $this->service->generate(
            $this->partner, $this->admin, [$e1->id, $e2->id],
            now()->subDays(15), now(),
        );

        expect($batch->item_count)->toBe(2);
        expect(PartnerEarning::find($e3->id)->payout_batch_id)->toBeNull();
    });

    it('tidak menyertakan earnings yang sudah masuk batch lain', function () {
        $otherBatch = PayoutBatch::factory()->for($this->partner)->create();
        $assigned   = PartnerEarning::factory()->for($this->partner)->available()->create(['payout_batch_id' => $otherBatch->id]);
        $free       = PartnerEarning::factory()->for($this->partner)->available()->create();

        $batch = $this->service->generate(
            $this->partner, $this->admin, [],
            now()->subDays(15), now(),
        );

        expect($batch->item_count)->toBe(1);
        expect($batch->total_amount)->toBe($free->amount);
    });

    it('abort 422 jika tidak ada earning yang tersedia', function () {
        expect(fn () => $this->service->generate(
            $this->partner, $this->admin, [],
            now()->subDays(15), now(),
        ))->toThrow(HttpException::class);
    });
});

// ── markPaid ─────────────────────────────────────────────────────────────────

describe('markPaid', function () {
    it('menandai batch dan semua earnings sebagai paid', function () {
        PartnerEarning::factory()->count(2)->for($this->partner)->available()->create();

        $batch = $this->service->generate($this->partner, $this->admin, [], now()->subDays(15), now());

        $updated = $this->service->markPaid($batch, $this->admin, 'https://example.com/proof.jpg');

        expect($updated->status)->toBe(PayoutStatus::Paid)
            ->and($updated->payment_proof)->toBe('https://example.com/proof.jpg')
            ->and($updated->paid_at)->not->toBeNull();

        expect(
            PartnerEarning::where('payout_batch_id', $batch->id)
                ->where('status', EarningStatus::Paid)
                ->count()
        )->toBe(2);
    });

    it('abort 422 jika batch sudah paid', function () {
        PartnerEarning::factory()->for($this->partner)->available()->create();
        $batch   = $this->service->generate($this->partner, $this->admin, [], now()->subDays(15), now());
        $this->service->markPaid($batch, $this->admin, 'https://example.com/proof.jpg');

        expect(fn () => $this->service->markPaid($batch->fresh(), $this->admin, 'https://example.com/proof2.jpg'))
            ->toThrow(HttpException::class);
    });
});

// ── markProcessing ───────────────────────────────────────────────────────────

describe('markProcessing', function () {
    it('mengubah status batch ke processing', function () {
        PartnerEarning::factory()->for($this->partner)->available()->create();
        $batch = $this->service->generate($this->partner, $this->admin, [], now()->subDays(15), now());

        $updated = $this->service->markProcessing($batch, $this->admin);

        expect($updated->status)->toBe(PayoutStatus::Processing);
    });
});

// ── cancel ───────────────────────────────────────────────────────────────────

describe('cancel', function () {
    it('membatalkan batch dan melepaskan earnings kembali ke available', function () {
        $earnings = PartnerEarning::factory()->count(2)->for($this->partner)->available()->create();

        $batch   = $this->service->generate($this->partner, $this->admin, [], now()->subDays(15), now());
        $updated = $this->service->cancel($batch, $this->admin, 'Alasan pembatalan');

        expect($updated->status)->toBe(PayoutStatus::Cancelled);

        expect(
            PartnerEarning::whereIn('id', $earnings->pluck('id'))
                ->whereNull('payout_batch_id')
                ->where('status', EarningStatus::Available)
                ->count()
        )->toBe(2);
    });

    it('abort 422 jika batch sudah paid', function () {
        PartnerEarning::factory()->for($this->partner)->available()->create();
        $batch = $this->service->generate($this->partner, $this->admin, [], now()->subDays(15), now());
        $this->service->markPaid($batch, $this->admin, 'https://example.com/proof.jpg');

        expect(fn () => $this->service->cancel($batch->fresh(), $this->admin))
            ->toThrow(HttpException::class);
    });
});
