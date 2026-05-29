<?php

declare(strict_types=1);

use App\Enums\EarningStatus;
use App\Enums\OrderStatus;
use App\Enums\ReturnRequestStatus;
use App\Models\AppNotification;
use App\Models\Order;
use App\Models\Partner;
use App\Models\PartnerEarning;
use App\Models\ReturnRequest;
use App\Models\User;
use App\Services\Order\ReturnRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\HttpException;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(ReturnRequestService::class);
    $this->admin   = User::factory()->admin()->create();
    $this->buyer   = User::factory()->state(['role' => 'buyer'])->create();
});

// ── create ─────────────────────────────────────────────────────────────────

describe('create', function () {
    it('membuat pengajuan retur untuk order yang sudah selesai', function () {
        $order = Order::factory()->completed()->create(['user_id' => $this->buyer->id]);

        $return = $this->service->create($order, $this->buyer, [
            'reason'      => 'damaged',
            'description' => 'Produk rusak saat diterima.',
        ]);

        expect($return)->toBeInstanceOf(ReturnRequest::class)
            ->and($return->status)->toBe(ReturnRequestStatus::Pending)
            ->and($return->return_number)->toStartWith('RTN-')
            ->and($return->order_id)->toBe($order->id);
    });

    it('abort 422 jika order belum diterima/selesai', function () {
        $order = Order::factory()->paid()->create(['user_id' => $this->buyer->id]);

        expect(fn () => $this->service->create($order, $this->buyer, [
            'reason'      => 'damaged',
            'description' => 'Produk rusak saat diterima.',
        ]))->toThrow(HttpException::class);
    });

    it('abort 422 jika sudah ada retur pending untuk order yang sama', function () {
        $order = Order::factory()->completed()->create(['user_id' => $this->buyer->id]);

        $this->service->create($order, $this->buyer, [
            'reason'      => 'damaged',
            'description' => 'Produk rusak saat diterima.',
        ]);

        expect(fn () => $this->service->create($order, $this->buyer, [
            'reason'      => 'wrong_item',
            'description' => 'Barang salah kirim juga.',
        ]))->toThrow(HttpException::class);
    });
});

// ── approve ────────────────────────────────────────────────────────────────

describe('approve', function () {
    it('menyetujui retur, merefund order, dan me-reverse earning', function () {
        $partner = Partner::factory()->create();
        $order   = Order::factory()->completed()->create(['user_id' => $this->buyer->id]);

        PartnerEarning::factory()->for($partner)->available()->create([
            'order_id' => $order->id,
        ]);

        $return = $this->service->create($order, $this->buyer, [
            'reason'      => 'damaged',
            'description' => 'Produk rusak saat diterima.',
        ]);

        $resolved = $this->service->approve($return, $this->admin, 'Bukti foto valid.');

        expect($resolved->status)->toBe(ReturnRequestStatus::Approved)
            ->and($resolved->resolved_by)->toBe($this->admin->id)
            ->and($resolved->resolved_at)->not->toBeNull();

        expect($order->fresh()->status)->toBe(OrderStatus::Refunded);

        expect(
            PartnerEarning::where('order_id', $order->id)
                ->where('status', EarningStatus::Reversed)
                ->count()
        )->toBe(1);

        expect(
            AppNotification::where('user_id', $this->buyer->id)
                ->where('type', 'return_approved')
                ->exists()
        )->toBeTrue();
    });

    it('abort 422 jika retur sudah ditinjau', function () {
        $order  = Order::factory()->completed()->create(['user_id' => $this->buyer->id]);
        $return = $this->service->create($order, $this->buyer, [
            'reason'      => 'damaged',
            'description' => 'Produk rusak saat diterima.',
        ]);

        $this->service->approve($return, $this->admin);

        expect(fn () => $this->service->approve($return->fresh(), $this->admin))
            ->toThrow(HttpException::class);
    });
});

// ── reject ─────────────────────────────────────────────────────────────────

describe('reject', function () {
    it('menolak retur tanpa mengubah status order', function () {
        $order  = Order::factory()->completed()->create(['user_id' => $this->buyer->id]);
        $return = $this->service->create($order, $this->buyer, [
            'reason'      => 'changed_mind',
            'description' => 'Berubah pikiran setelah beli.',
        ]);

        $resolved = $this->service->reject($return, $this->admin, 'Tidak memenuhi syarat retur.');

        expect($resolved->status)->toBe(ReturnRequestStatus::Rejected)
            ->and($resolved->admin_note)->toBe('Tidak memenuhi syarat retur.');

        expect($order->fresh()->status)->toBe(OrderStatus::Completed);

        expect(
            AppNotification::where('user_id', $this->buyer->id)
                ->where('type', 'return_rejected')
                ->exists()
        )->toBeTrue();
    });
});
