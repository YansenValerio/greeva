'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Skeleton, KpiCardSkeleton } from '@/components/shared/Skeleton';
import { getPartnerEarningSummary, getPartnerPayouts } from '@/lib/api/partner';
import type { EarningSummary, PayoutBatch } from '@/types/partner';

export default function PartnerDashboardPage() {
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPartnerEarningSummary(),
      getPartnerPayouts({ per_page: 5 }),
    ])
      .then(([s, p]) => {
        setSummary(s);
        setPayouts(p.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const PAYOUT_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
    paid: 'green',
    processing: 'amber',
    pending: 'amber',
    cancelled: 'gray',
    failed: 'gray',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card bg-white p-5 shadow-card">
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Menunggu</p>
          <p className="mt-2 text-2xl font-bold text-greeva-black">
            {summary ? <Price cents={summary.pending} /> : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-400">Dalam cooling period</p>
        </div>
        <div className="rounded-card bg-greeva-mint-light p-5">
          <p className="text-caption uppercase tracking-[0.08em] text-greeva-forest-dark/70">
            Dapat Dicairkan
          </p>
          <p className="mt-2 text-2xl font-bold text-greeva-forest-dark">
            {summary ? <Price cents={summary.available} /> : '—'}
          </p>
          <p className="mt-1 text-xs text-greeva-forest-dark/60">Siap payout</p>
        </div>
        <div className="rounded-card bg-white p-5 shadow-card">
          <p className="text-caption uppercase tracking-[0.08em] text-gray-500">Sudah Dibayar</p>
          <p className="mt-2 text-2xl font-bold text-greeva-black">
            {summary ? <Price cents={summary.paid} /> : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-400">Total terbayar</p>
        </div>
      </div>

      {/* Recent payouts */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-greeva-black">Payout Terbaru</h2>
          <Link href="/partner/payouts" className="text-sm text-greeva-starbucks-green hover:underline">
            Lihat semua →
          </Link>
        </div>

        {payouts.length === 0 ? (
          <div className="rounded-card bg-white py-8 text-center text-sm text-gray-400 shadow-card">
            Belum ada riwayat payout.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
            {payouts.map((p) => (
              <Link
                key={p.id}
                href={`/partner/payouts`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-greeva-black">{p.payout_number}</p>
                  <p className="text-xs text-gray-400">
                    {p.period_start} – {p.period_end}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Price cents={p.total_amount} className="text-sm font-semibold text-greeva-forest-dark" />
                  <Badge variant={PAYOUT_BADGE[p.status] ?? 'gray'}>{p.status_label}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
