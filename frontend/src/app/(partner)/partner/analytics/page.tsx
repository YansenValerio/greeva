'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Price } from '@/components/shared/Price';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton, KpiCardSkeleton } from '@/components/shared/Skeleton';
import { getPartnerAnalytics } from '@/lib/api/partner';
import type { PartnerAnalytics } from '@/types/partner';

function monthLabel(ym: string): string {
  const [year, month] = ym.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('id-ID', { month: 'short' });
}

export default function PartnerAnalyticsPage() {
  const [data, setData] = useState<PartnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPartnerAnalytics()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Analitik" />
        <EmptyState
          icon={TrendingUp}
          title="Gagal memuat data"
          description="Data analitik tidak dapat dimuat. Coba muat ulang halaman."
        />
      </div>
    );
  }

  const { summary, top_products, monthly_trend } = data;
  const maxGross = Math.max(...monthly_trend.map((m) => m.gross_sales), 1);

  return (
    <div>
      <PageHeader
        title="Analitik"
        description="Ringkasan performa penjualan produk konsinyasi Anda."
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-white p-5 shadow-card">
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Unit Terjual</p>
          <p className="mt-2 text-2xl font-bold text-greeva-black">{summary.units_sold}</p>
        </div>
        <div className="rounded-card bg-greeva-mint-light p-5">
          <p className="text-caption uppercase tracking-[0.08em] text-greeva-forest-dark/70">
            Penjualan Kotor
          </p>
          <Price
            cents={summary.gross_sales}
            className="mt-2 block text-2xl font-bold text-greeva-forest-dark"
          />
        </div>
        <div className="rounded-card bg-white p-5 shadow-card">
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Total Pesanan</p>
          <p className="mt-2 text-2xl font-bold text-greeva-black">{summary.total_orders}</p>
        </div>
        <div className="rounded-card bg-white p-5 shadow-card">
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">
            Total Pendapatan
          </p>
          <Price
            cents={summary.total_earnings}
            className="mt-2 block text-2xl font-bold text-greeva-black"
          />
        </div>
        <div className="rounded-card bg-white p-5 shadow-card">
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Produk Aktif</p>
          <p className="mt-2 text-2xl font-bold text-greeva-black">{summary.active_products}</p>
        </div>
        <div
          className={`rounded-card p-5 shadow-card ${
            summary.low_stock_variants > 0 ? 'bg-amber-50' : 'bg-white'
          }`}
        >
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Stok Menipis</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              summary.low_stock_variants > 0 ? 'text-amber-700' : 'text-greeva-black'
            }`}
          >
            {summary.low_stock_variants}
          </p>
          <p className="mt-1 text-xs text-gray-400">Varian dengan stok ≤ 5</p>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="mt-10">
        <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Tren 6 Bulan Terakhir</h2>
        <div className="rounded-card bg-white p-6 shadow-card">
          <div className="flex h-52 items-end justify-between gap-3">
            {monthly_trend.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-greeva-forest transition-all"
                    style={{
                      height: `${Math.max((m.gross_sales / maxGross) * 100, m.gross_sales > 0 ? 4 : 0)}%`,
                    }}
                    title={`${m.units_sold} unit`}
                  />
                </div>
                <span className="text-xs font-medium capitalize text-gray-500">
                  {monthLabel(m.month)}
                </span>
                <Price cents={m.gross_sales} className="text-[10px] text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="mt-10">
        <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Produk Terlaris</h2>
        {top_products.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            size="sm"
            title="Belum ada penjualan"
            description="Produk terlaris akan muncul di sini setelah ada transaksi."
          />
        ) : (
          <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
            {top_products.map((p, i) => (
              <div
                key={p.product_id ?? `row-${i}`}
                className="flex items-center gap-4 px-5 py-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-greeva-mint-light text-sm font-semibold text-greeva-forest-dark">
                  {i + 1}
                </span>
                <p className="flex-1 min-w-0 truncate text-sm font-medium text-greeva-black">
                  {p.name}
                </p>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-sm font-semibold text-greeva-black">
                    {p.units_sold} unit
                  </span>
                  <Price cents={p.gross_sales} className="text-xs text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
