<?php

declare(strict_types=1);

namespace App\Services\Analytics;

use App\Enums\EarningStatus;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Enums\ProductStatus;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    /** Status order yang dihitung sebagai penjualan sukses. */
    private const PAID_STATUSES = ['paid', 'packing', 'shipped', 'delivered', 'completed'];

    private const LOW_STOCK_THRESHOLD = 5;

    private const TREND_MONTHS = 6;

    /**
     * @return array<string, mixed>
     */
    public function overview(): array
    {
        return [
            'revenue'        => $this->revenue(),
            'orders'         => $this->orders(),
            'payouts'        => $this->payouts(),
            'top_partners'   => $this->topPartners(),
            'top_categories' => $this->topCategories(),
            'low_stock'      => $this->lowStock(),
        ];
    }

    /**
     * GMV (grand_total order dibayar) bulan ini vs bulan lalu + tren 6 bulan.
     *
     * @return array<string, mixed>
     */
    private function revenue(): array
    {
        $thisMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = $thisMonthStart->copy()->subMonth();

        $thisMonth = (int) $this->paidOrdersQuery()
            ->where('paid_at', '>=', $thisMonthStart)
            ->sum('grand_total');

        $lastMonth = (int) $this->paidOrdersQuery()
            ->where('paid_at', '>=', $lastMonthStart)
            ->where('paid_at', '<', $thisMonthStart)
            ->sum('grand_total');

        $changePercent = $lastMonth > 0
            ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1)
            : null;

        return [
            'this_month'     => $thisMonth,
            'last_month'     => $lastMonth,
            'change_percent' => $changePercent,
            'monthly_trend'  => $this->monthlyTrend(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function monthlyTrend(): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths(self::TREND_MONTHS - 1);

        $rows = $this->paidOrdersQuery()
            ->where('paid_at', '>=', $start)
            ->selectRaw($this->monthExpression() . ' as month')
            ->selectRaw('SUM(grand_total) as revenue')
            ->selectRaw('COUNT(*) as orders')
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $trend = [];
        for ($i = 0; $i < self::TREND_MONTHS; $i++) {
            $month = $start->copy()->addMonths($i)->format('Y-m');
            $row   = $rows->get($month);

            $trend[] = [
                'month'   => $month,
                'revenue' => $row ? (int) $row->revenue : 0,
                'orders'  => $row ? (int) $row->orders : 0,
            ];
        }

        return $trend;
    }

    /**
     * @return array<string, int>
     */
    private function orders(): array
    {
        $thisMonthStart = Carbon::now()->startOfMonth();

        return [
            'this_month' => $this->paidOrdersQuery()
                ->where('paid_at', '>=', $thisMonthStart)
                ->count(),
            'pending_payment' => DB::table('orders')
                ->whereNull('deleted_at')
                ->where('status', OrderStatus::PendingPayment->value)
                ->count(),
            // Order yang sudah dibayar tapi belum dikirim — perlu aksi admin (fulfillment)
            'needs_fulfillment' => DB::table('orders')
                ->whereNull('deleted_at')
                ->whereIn('status', [OrderStatus::Paid->value, OrderStatus::Packing->value])
                ->count(),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function payouts(): array
    {
        $pending = DB::table('payout_batches')
            ->whereNull('deleted_at')
            ->whereIn('status', [PayoutStatus::Pending->value, PayoutStatus::Processing->value])
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total')
            ->first();

        // Earning yang sudah matang tapi belum masuk batch — utang ke mitra
        $availableEarnings = (int) DB::table('partner_earnings')
            ->whereNull('deleted_at')
            ->where('status', EarningStatus::Available->value)
            ->sum('amount');

        return [
            'pending_batches'    => (int) ($pending->count ?? 0),
            'pending_amount'     => (int) ($pending->total ?? 0),
            'available_earnings' => $availableEarnings,
        ];
    }

    /**
     * Mitra dengan penjualan kotor tertinggi (top 5).
     *
     * @return array<int, array<string, mixed>>
     */
    private function topPartners(): array
    {
        return $this->paidItemsQuery()
            ->join('partners as pt', 'pt.id', '=', 'oi.partner_id')
            ->selectRaw('oi.partner_id')
            ->selectRaw('MIN(pt.name) as name')
            ->selectRaw('SUM(oi.subtotal) as gross_sales')
            ->selectRaw('SUM(oi.quantity) as units_sold')
            ->groupBy('oi.partner_id')
            ->orderByDesc('gross_sales')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'partner_id'  => (int) $row->partner_id,
                'name'        => $row->name,
                'gross_sales' => (int) $row->gross_sales,
                'units_sold'  => (int) $row->units_sold,
            ])
            ->all();
    }

    /**
     * Kategori dengan penjualan kotor tertinggi (top 5).
     *
     * @return array<int, array<string, mixed>>
     */
    private function topCategories(): array
    {
        return $this->paidItemsQuery()
            ->join('products as p', 'p.id', '=', 'oi.product_id')
            ->join('categories as c', 'c.id', '=', 'p.category_id')
            ->selectRaw('c.id as category_id')
            ->selectRaw('MIN(c.name) as name')
            ->selectRaw('SUM(oi.subtotal) as gross_sales')
            ->selectRaw('SUM(oi.quantity) as units_sold')
            ->groupBy('c.id')
            ->orderByDesc('gross_sales')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'category_id' => (int) $row->category_id,
                'name'        => $row->name,
                'gross_sales' => (int) $row->gross_sales,
                'units_sold'  => (int) $row->units_sold,
            ])
            ->all();
    }

    /**
     * Varian aktif dengan stok menipis (≤ ambang batas), lintas mitra.
     *
     * @return array<int, array<string, mixed>>
     */
    private function lowStock(): array
    {
        return DB::table('product_variants as pv')
            ->join('products as p', 'p.id', '=', 'pv.product_id')
            ->join('partners as pt', 'pt.id', '=', 'p.partner_id')
            ->whereNull('pv.deleted_at')
            ->whereNull('p.deleted_at')
            ->where('pv.is_active', true)
            ->where('p.status', ProductStatus::Active->value)
            ->where('pv.stock', '<=', self::LOW_STOCK_THRESHOLD)
            ->orderBy('pv.stock')
            ->limit(10)
            ->get([
                'pv.id as variant_id',
                'pv.product_id',
                'pv.name as variant_name',
                'pv.sku',
                'pv.stock',
                'p.name as product_name',
                'pt.name as partner_name',
            ])
            ->map(fn ($row) => [
                'variant_id'   => (int) $row->variant_id,
                'product_id'   => (int) $row->product_id,
                'product_name' => $row->product_name,
                'variant_name' => $row->variant_name,
                'partner_name' => $row->partner_name,
                'sku'          => $row->sku,
                'stock'        => (int) $row->stock,
            ])
            ->all();
    }

    private function monthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite'           => "strftime('%Y-%m', paid_at)",
            'mysql', 'mariadb' => "date_format(paid_at, '%Y-%m')",
            default            => "to_char(paid_at, 'YYYY-MM')",
        };
    }

    private function paidOrdersQuery(): \Illuminate\Database\Query\Builder
    {
        return DB::table('orders')
            ->whereNull('deleted_at')
            ->whereIn('status', self::PAID_STATUSES)
            ->whereNotNull('paid_at');
    }

    private function paidItemsQuery(): \Illuminate\Database\Query\Builder
    {
        return DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->whereNull('o.deleted_at')
            ->whereIn('o.status', self::PAID_STATUSES);
    }
}
