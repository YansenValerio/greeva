<?php

declare(strict_types=1);

namespace App\Services\Analytics;

use App\Enums\EarningStatus;
use App\Enums\ProductStatus;
use App\Models\Partner;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PartnerAnalyticsService
{
    /** Status order yang dihitung sebagai penjualan sukses (stok sudah dipotong & dibayar). */
    private const PAID_STATUSES = ['paid', 'packing', 'shipped', 'delivered', 'completed'];

    /** Ambang batas stok rendah untuk peringatan. */
    private const LOW_STOCK_THRESHOLD = 5;

    /** Jumlah bulan terakhir untuk tren. */
    private const TREND_MONTHS = 6;

    /**
     * @return array<string, mixed>
     */
    public function overview(Partner $partner): array
    {
        return [
            'summary'       => $this->summary($partner),
            'top_products'  => $this->topProducts($partner),
            'monthly_trend' => $this->monthlyTrend($partner),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function summary(Partner $partner): array
    {
        $sales = $this->paidItemsQuery($partner->id)
            ->selectRaw('COALESCE(SUM(oi.quantity), 0) as units_sold')
            ->selectRaw('COALESCE(SUM(oi.subtotal), 0) as gross_sales')
            ->selectRaw('COUNT(DISTINCT oi.order_id) as total_orders')
            ->first();

        $totalEarnings = (int) DB::table('partner_earnings')
            ->where('partner_id', $partner->id)
            ->whereNull('deleted_at')
            ->whereIn('status', [
                EarningStatus::Pending->value,
                EarningStatus::Available->value,
                EarningStatus::Paid->value,
            ])
            ->sum('amount');

        $activeProducts = DB::table('products')
            ->where('partner_id', $partner->id)
            ->whereNull('deleted_at')
            ->where('status', ProductStatus::Active->value)
            ->count();

        $lowStockVariants = $this->partnerVariantsQuery($partner->id)
            ->where('pv.is_active', true)
            ->where('pv.stock', '<=', self::LOW_STOCK_THRESHOLD)
            ->count();

        return [
            'units_sold'         => (int) ($sales->units_sold ?? 0),
            'gross_sales'        => (int) ($sales->gross_sales ?? 0),
            'total_orders'       => (int) ($sales->total_orders ?? 0),
            'total_earnings'     => $totalEarnings,
            'active_products'    => $activeProducts,
            'low_stock_variants' => $lowStockVariants,
        ];
    }

    /**
     * Produk terlaris berdasarkan unit terjual (top 5).
     *
     * @return array<int, array<string, mixed>>
     */
    private function topProducts(Partner $partner): array
    {
        return $this->paidItemsQuery($partner->id)
            ->selectRaw('oi.product_id')
            ->selectRaw('MIN(oi.product_name) as product_name')
            ->selectRaw('SUM(oi.quantity) as units_sold')
            ->selectRaw('SUM(oi.subtotal) as gross_sales')
            ->groupBy('oi.product_id')
            ->orderByDesc('units_sold')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'product_id'  => $row->product_id !== null ? (int) $row->product_id : null,
                'name'        => $row->product_name,
                'units_sold'  => (int) $row->units_sold,
                'gross_sales' => (int) $row->gross_sales,
            ])
            ->all();
    }

    /**
     * Tren penjualan 6 bulan terakhir (termasuk bulan tanpa penjualan).
     *
     * @return array<int, array<string, mixed>>
     */
    private function monthlyTrend(Partner $partner): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths(self::TREND_MONTHS - 1);

        $rows = $this->paidItemsQuery($partner->id)
            ->whereNotNull('o.paid_at')
            ->where('o.paid_at', '>=', $start)
            ->selectRaw($this->monthExpression() . ' as month')
            ->selectRaw('SUM(oi.quantity) as units_sold')
            ->selectRaw('SUM(oi.subtotal) as gross_sales')
            ->selectRaw('COUNT(DISTINCT oi.order_id) as orders')
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $trend = [];
        for ($i = 0; $i < self::TREND_MONTHS; $i++) {
            $month = $start->copy()->addMonths($i)->format('Y-m');
            $row   = $rows->get($month);

            $trend[] = [
                'month'       => $month,
                'units_sold'  => $row ? (int) $row->units_sold : 0,
                'gross_sales' => $row ? (int) $row->gross_sales : 0,
                'orders'      => $row ? (int) $row->orders : 0,
            ];
        }

        return $trend;
    }

    /**
     * Ekspresi SQL untuk mengelompokkan tanggal per bulan (YYYY-MM),
     * disesuaikan dengan driver database aktif.
     */
    private function monthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite'           => "strftime('%Y-%m', o.paid_at)",
            'mysql', 'mariadb' => "date_format(o.paid_at, '%Y-%m')",
            default            => "to_char(o.paid_at, 'YYYY-MM')",
        };
    }

    /**
     * Query dasar order_items milik mitra di order yang sudah dibayar.
     */
    private function paidItemsQuery(int $partnerId): \Illuminate\Database\Query\Builder
    {
        return DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->whereNull('o.deleted_at')
            ->whereIn('o.status', self::PAID_STATUSES)
            ->where('oi.partner_id', $partnerId);
    }

    /**
     * Query dasar varian aktif milik produk mitra (untuk hitung stok rendah).
     */
    private function partnerVariantsQuery(int $partnerId): \Illuminate\Database\Query\Builder
    {
        return DB::table('product_variants as pv')
            ->join('products as p', 'p.id', '=', 'pv.product_id')
            ->whereNull('pv.deleted_at')
            ->whereNull('p.deleted_at')
            ->where('p.partner_id', $partnerId);
    }
}
