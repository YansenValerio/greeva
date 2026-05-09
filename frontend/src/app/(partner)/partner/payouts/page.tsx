'use client';

import { useEffect, useState } from 'react';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { getPartnerPayouts } from '@/lib/api/partner';
import type { PayoutBatch } from '@/types/partner';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  paid: 'green',
  processing: 'amber',
  pending: 'amber',
  cancelled: 'gray',
  failed: 'gray',
};

export default function PartnerPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPartnerPayouts({ per_page: 50 })
      .then((res) => setPayouts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-card bg-gray-100" />)}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Riwayat Payout" />

      {payouts.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Belum ada payout.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-greeva-black">{p.payout_number}</p>
                <p className="text-xs text-gray-400">
                  Periode: {p.period_start} – {p.period_end}
                </p>
                {p.paid_at && (
                  <p className="text-xs text-gray-400">
                    Dibayar:{' '}
                    {new Date(p.paid_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Price cents={p.total_amount} className="font-semibold text-greeva-forest-dark" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{p.item_count} item</span>
                  <Badge variant={STATUS_BADGE[p.status] ?? 'gray'}>{p.status_label}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
