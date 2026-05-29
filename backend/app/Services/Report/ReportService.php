<?php

declare(strict_types=1);

namespace App\Services\Report;

use App\Models\Order;
use App\Models\PartnerEarning;
use App\Models\PayoutBatch;
use App\Support\Money;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Menghasilkan data laporan dalam bentuk header + rows (siap di-stream ke CSV).
 *
 * Semua nilai uang dikonversi ke RUPIAH INTEGER (bukan sen, bukan "Rp ...")
 * agar langsung bisa dipakai untuk kalkulasi di spreadsheet.
 *
 * @phpstan-type Report array{filename: string, header: array<int, string>, rows: array<int, array<int, string|int>>}
 */
class ReportService
{
    /**
     * Laporan penjualan (orders) dalam rentang tanggal.
     *
     * @return array{filename: string, header: array<int, string>, rows: array<int, array<int, string|int>>}
     */
    public function sales(?string $from, ?string $to): array
    {
        [$start, $end] = $this->resolveRange($from, $to);

        $orders = Order::with('items')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->get();

        $rows = $orders->map(fn (Order $o) => [
            $o->order_number,
            $o->created_at?->format('Y-m-d H:i') ?? '',
            $o->status->label(),
            $o->items->sum('quantity'),
            Money::toRupiah($o->subtotal),
            Money::toRupiah($o->shipping_total),
            Money::toRupiah($o->discount_total),
            Money::toRupiah($o->grand_total),
        ])->all();

        return [
            'filename' => $this->filename('penjualan', $start, $end),
            'header'   => ['No. Pesanan', 'Tanggal', 'Status', 'Jumlah Item', 'Subtotal', 'Ongkir', 'Diskon', 'Total'],
            'rows'     => $rows,
        ];
    }

    /**
     * Laporan earning per mitra (detail per earning).
     *
     * @return array{filename: string, header: array<int, string>, rows: array<int, array<int, string|int>>}
     */
    public function earnings(?string $from, ?string $to, ?int $partnerId): array
    {
        [$start, $end] = $this->resolveRange($from, $to);

        $query = PartnerEarning::with(['partner:id,name', 'orderItem:id,product_name,variant_name', 'order:id,order_number'])
            ->whereBetween('created_at', [$start, $end])
            ->latest();

        if ($partnerId !== null) {
            $query->where('partner_id', $partnerId);
        }

        $rows = $query->get()->map(fn (PartnerEarning $e) => [
            $e->partner?->name ?? '—',
            $e->order?->order_number ?? "#{$e->order_id}",
            $e->orderItem?->product_name ?? '—',
            $e->orderItem?->variant_name ?? '—',
            Money::toRupiah($e->amount),
            $e->status->label(),
            $e->order_completed_at?->format('Y-m-d') ?? '',
            $e->paid_at?->format('Y-m-d') ?? '',
        ])->all();

        return [
            'filename' => $this->filename('earning-mitra', $start, $end),
            'header'   => ['Mitra', 'No. Pesanan', 'Produk', 'Varian', 'Earning', 'Status', 'Tgl Selesai', 'Tgl Dibayar'],
            'rows'     => $rows,
        ];
    }

    /**
     * Rekap payout batch dalam rentang tanggal.
     *
     * @return array{filename: string, header: array<int, string>, rows: array<int, array<int, string|int>>}
     */
    public function payouts(?string $from, ?string $to): array
    {
        [$start, $end] = $this->resolveRange($from, $to);

        $batches = PayoutBatch::with('partner:id,name')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->get();

        $rows = $batches->map(fn (PayoutBatch $p) => [
            $p->payout_number,
            $p->partner?->name ?? '—',
            $p->period_start?->format('Y-m-d') ?? '',
            $p->period_end?->format('Y-m-d') ?? '',
            $p->item_count,
            Money::toRupiah($p->total_amount),
            $p->status->label(),
            $p->paid_at?->format('Y-m-d') ?? '',
        ])->all();

        return [
            'filename' => $this->filename('rekap-payout', $start, $end),
            'header'   => ['No. Payout', 'Mitra', 'Periode Mulai', 'Periode Selesai', 'Jumlah Earning', 'Total', 'Status', 'Tgl Dibayar'],
            'rows'     => $rows,
        ];
    }

    /**
     * @return array{0: CarbonInterface, 1: CarbonInterface}
     */
    private function resolveRange(?string $from, ?string $to): array
    {
        $start = $from ? Carbon::parse($from)->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $end   = $to ? Carbon::parse($to)->endOfDay() : Carbon::now()->endOfDay();

        return [$start, $end];
    }

    private function filename(string $prefix, CarbonInterface $start, CarbonInterface $end): string
    {
        return sprintf('greeva-%s-%s-sd-%s.csv', $prefix, $start->format('Ymd'), $end->format('Ymd'));
    }
}
