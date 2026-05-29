'use client';

import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { adminGetAllEarnings, adminReverseEarning } from '@/lib/api/admin';
import { toast, confirm } from '@/lib/feedback';
import type { PartnerEarning } from '@/types/partner';
import type { PaginationMeta } from '@/types/api';

type EarningStatus = 'pending' | 'available' | 'paid' | 'reversed' | '';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  available: 'green',
  pending: 'amber',
  paid: 'gray',
  reversed: 'gray',
};

const FILTERS: { label: string; value: EarningStatus }[] = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Dapat Dicairkan', value: 'available' },
  { label: 'Sudah Dibayar', value: 'paid' },
  { label: 'Dibatalkan', value: 'reversed' },
];

export default function AdminEarningsPage() {
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EarningStatus>('');
  const [loading, setLoading] = useState(true);
  const [reversingId, setReversingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    adminGetAllEarnings({ page, per_page: 20, status: status || undefined })
      .then((res) => {
        setEarnings(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status]);

  function changeStatus(v: EarningStatus) {
    setStatus(v);
    setPage(1);
  }

  async function handleReverse(earning: PartnerEarning) {
    const reason = window.prompt('Alasan pembatalan earning ini?');
    if (!reason?.trim()) return;

    const ok = await confirm({
      title: 'Batalkan earning?',
      message: `Earning sebesar ini akan dibatalkan dengan alasan: "${reason}"`,
      danger: true,
      confirmText: 'Batalkan Earning',
    });
    if (!ok) return;

    setReversingId(earning.id);
    try {
      const updated = await adminReverseEarning(earning.id, reason.trim());
      setEarnings((prev) => prev.map((e) => (e.id === earning.id ? updated : e)));
      toast.success('Earning berhasil dibatalkan.');
    } catch {
      toast.error('Gagal membatalkan earning.');
    } finally {
      setReversingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Manajemen Earning" />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => changeStatus(f.value)}
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
        <ListSkeleton rows={5} height="h-16" />
      ) : earnings.length === 0 ? (
        <EmptyState icon={Coins} title="Tidak ada earning" description="Earning akan muncul setelah pesanan selesai." />
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
                {e.reversal_reason && (
                  <p className="mt-0.5 text-xs italic text-red-400">
                    Alasan: {e.reversal_reason}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Price cents={e.amount} className="text-sm font-semibold text-greeva-forest-dark" />
                <Badge variant={STATUS_BADGE[e.status] ?? 'gray'}>{e.status_label}</Badge>
              </div>
              {(e.status === 'pending' || e.status === 'available') && (
                <button
                  onClick={() => handleReverse(e)}
                  disabled={reversingId === e.id}
                  className="rounded-pill border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {reversingId === e.id ? '...' : 'Batalkan'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          className="mt-6"
        />
      )}
    </div>
  );
}
