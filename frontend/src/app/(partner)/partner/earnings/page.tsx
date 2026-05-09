'use client';

import { useEffect, useState } from 'react';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { getPartnerEarnings, getPartnerEarningSummary } from '@/lib/api/partner';
import type { PartnerEarning, EarningSummary } from '@/types/partner';

type EarningStatus = 'pending' | 'available' | 'paid' | 'reversed';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  available: 'green',
  pending: 'amber',
  paid: 'gray',
  reversed: 'gray',
};

const FILTERS: { label: string; value: EarningStatus | '' }[] = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Dapat Dicairkan', value: 'available' },
  { label: 'Sudah Dibayar', value: 'paid' },
  { label: 'Dibatalkan', value: 'reversed' },
];

export default function PartnerEarningsPage() {
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [status, setStatus] = useState<EarningStatus | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPartnerEarnings({ per_page: 50, status: status || undefined }),
      getPartnerEarningSummary(),
    ])
      .then(([e, s]) => {
        setEarnings(e.data);
        setSummary(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <PageHeader title="Pendapatan" />

      {/* Summary */}
      {summary && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-card bg-white p-4 shadow-card text-center">
            <p className="text-xs text-gray-400">Menunggu</p>
            <Price cents={summary.pending} className="mt-1 block font-bold text-greeva-black" />
          </div>
          <div className="rounded-card bg-greeva-mint-light p-4 text-center">
            <p className="text-xs text-greeva-forest-dark/60">Dapat Dicairkan</p>
            <Price cents={summary.available} className="mt-1 block font-bold text-greeva-forest-dark" />
          </div>
          <div className="rounded-card bg-white p-4 shadow-card text-center">
            <p className="text-xs text-gray-400">Dibayar</p>
            <Price cents={summary.paid} className="mt-1 block font-bold text-greeva-black" />
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              status === f.value
                ? 'bg-greeva-forest text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-card bg-gray-100" />)}
        </div>
      ) : earnings.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Tidak ada data pendapatan.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {earnings.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-greeva-black">
                  {e.order_item?.product_name ?? `Order #${e.order_id}`}
                </p>
                {e.order_item && (
                  <p className="text-xs text-gray-400">
                    {e.order_item.variant_name} × {e.order_item.quantity}
                  </p>
                )}
                {e.order_completed_at && (
                  <p className="text-xs text-gray-400">
                    Selesai:{' '}
                    {new Date(e.order_completed_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Price cents={e.amount} className="text-sm font-semibold text-greeva-forest-dark" />
                <Badge variant={STATUS_BADGE[e.status] ?? 'gray'}>{e.status_label}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
