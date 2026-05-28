'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { Price } from '@/components/shared/Price';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton, KpiCardSkeleton } from '@/components/shared/Skeleton';
import { adminGetDashboard } from '@/lib/api/admin';
import type { AdminDashboard } from '@/types/admin';

const QUICK_LINKS = [
  { label: 'Kelola Produk', href: '/admin/products' },
  { label: 'Kelola Pesanan', href: '/admin/orders' },
  { label: 'Kelola Mitra', href: '/admin/partners' },
  { label: 'Kelola Payout', href: '/admin/payouts' },
];

function monthLabel(ym: string): string {
  const [year, month] = ym.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <PageHeader title="Admin Greeva" />
        <EmptyState
          icon={LayoutDashboard}
          title="Gagal memuat dashboard"
          description="Data dashboard tidak dapat dimuat. Coba muat ulang halaman."
        />
      </div>
    );
  }

  const { revenue, orders, payouts, top_partners, top_categories, low_stock } = data;
  const maxRevenue = Math.max(...revenue.monthly_trend.map((m) => m.revenue), 1);
  const change = revenue.change_percent;

  return (
    <div>
      <PageHeader title="Admin Greeva" description="Ringkasan operasional platform." />

      {/* Headline KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-card bg-greeva-emerald p-5 text-white">
          <p className="text-caption uppercase tracking-[0.08em] text-white/70">Revenue Bulan Ini</p>
          <Price cents={revenue.this_month} className="mt-2 block text-2xl font-bold" />
          {change !== null && (
            <p className={`mt-1 text-xs ${change >= 0 ? 'text-greeva-leaf' : 'text-red-300'}`}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs bulan lalu
            </p>
          )}
        </div>
        <Link
          href="/admin/orders"
          className="rounded-card bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Perlu Dikirim</p>
          <p className="mt-2 text-2xl font-bold text-greeva-black">{orders.needs_fulfillment}</p>
          <p className="mt-1 text-xs text-gray-400">Pesanan dibayar, belum dikirim</p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-card bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Menunggu Bayar</p>
          <p className="mt-2 text-2xl font-bold text-greeva-black">{orders.pending_payment}</p>
          <p className="mt-1 text-xs text-gray-400">Pesanan belum dibayar</p>
        </Link>
        <Link
          href="/admin/payouts"
          className="rounded-card bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Siap Dicairkan</p>
          <Price
            cents={payouts.available_earnings}
            className="mt-2 block text-2xl font-bold text-greeva-forest-dark"
          />
          <p className="mt-1 text-xs text-gray-400">
            {payouts.pending_batches} batch payout berjalan
          </p>
        </Link>
      </div>

      {/* Revenue trend */}
      <div className="mt-10">
        <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Revenue 6 Bulan Terakhir</h2>
        <div className="rounded-card bg-white p-6 shadow-card">
          <div className="flex h-52 items-end justify-between gap-3">
            {revenue.monthly_trend.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-greeva-forest transition-all"
                    style={{
                      height: `${Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 4 : 0)}%`,
                    }}
                    title={`${m.orders} pesanan`}
                  />
                </div>
                <span className="text-xs font-medium capitalize text-gray-500">
                  {monthLabel(m.month)}
                </span>
                <Price cents={m.revenue} className="text-[10px] text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top mitra & kategori */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Mitra Teratas</h2>
          {top_partners.length === 0 ? (
            <div className="rounded-card bg-white py-8 text-center text-sm text-gray-400 shadow-card">
              Belum ada penjualan.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
              {top_partners.map((p, i) => (
                <div key={p.partner_id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-greeva-mint-light text-xs font-semibold text-greeva-forest-dark">
                    {i + 1}
                  </span>
                  <p className="flex-1 min-w-0 truncate text-sm font-medium text-greeva-black">
                    {p.name}
                  </p>
                  <Price cents={p.gross_sales} className="text-sm font-semibold text-greeva-black" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Kategori Teratas</h2>
          {top_categories.length === 0 ? (
            <div className="rounded-card bg-white py-8 text-center text-sm text-gray-400 shadow-card">
              Belum ada penjualan.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
              {top_categories.map((c, i) => (
                <div key={c.category_id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-greeva-mint-light text-xs font-semibold text-greeva-forest-dark">
                    {i + 1}
                  </span>
                  <p className="flex-1 min-w-0 truncate text-sm font-medium text-greeva-black">
                    {c.name}
                  </p>
                  <Price cents={c.gross_sales} className="text-sm font-semibold text-greeva-black" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock alerts */}
      <div className="mt-10">
        <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Peringatan Stok Menipis</h2>
        {low_stock.length === 0 ? (
          <p className="rounded-card bg-greeva-mint-light px-5 py-4 text-sm text-greeva-forest-dark">
            Semua varian aktif punya stok yang aman.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
            {low_stock.map((v) => (
              <Link
                key={v.variant_id}
                href={`/admin/products/${v.product_id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-greeva-black">
                    {v.product_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {v.partner_name} · {v.variant_name} · {v.sku}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-pill px-3 py-1 text-xs font-semibold ${
                    v.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {v.stock} tersisa
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Aksi Cepat</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-card bg-white p-4 text-center text-sm font-medium text-greeva-forest-dark shadow-card transition-shadow hover:shadow-card-hover"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
