'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { adminGetReturns, adminApproveReturn, adminRejectReturn } from '@/lib/api/admin';
import { toast, confirm } from '@/lib/feedback';
import { RETURN_REASON_LABELS, type ReturnRequest, type ReturnStatus } from '@/types/return';
import type { PaginationMeta } from '@/types/api';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'gray',
};

const FILTERS: { label: string; value: ReturnStatus | '' }[] = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Disetujui', value: 'approved' },
  { label: 'Ditolak', value: 'rejected' },
];

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReturnStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    adminGetReturns({ page, per_page: 20, status: status || undefined })
      .then((res) => {
        setReturns(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status]);

  function changeStatus(v: ReturnStatus | '') {
    setStatus(v);
    setPage(1);
  }

  function patchLocal(updated: ReturnRequest) {
    setReturns((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleApprove(ret: ReturnRequest) {
    const ok = await confirm({
      title: 'Setujui retur?',
      message: `Pesanan ${ret.order_number} akan direfund dan earning mitra dibatalkan. Tindakan ini tidak bisa dibatalkan.`,
      danger: true,
      confirmText: 'Setujui & Refund',
    });
    if (!ok) return;
    setBusyId(ret.id);
    try {
      const updated = await adminApproveReturn(ret.id);
      patchLocal(updated);
      toast.success('Retur disetujui. Pesanan direfund.');
    } catch {
      toast.error('Gagal menyetujui retur.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(ret: ReturnRequest) {
    const note = window.prompt('Alasan penolakan retur ini?');
    if (!note?.trim()) return;
    setBusyId(ret.id);
    try {
      const updated = await adminRejectReturn(ret.id, note.trim());
      patchLocal(updated);
      toast.success('Pengajuan retur ditolak.');
    } catch {
      toast.error('Gagal menolak retur.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Pengajuan Retur" />

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
        <ListSkeleton rows={4} height="h-28" />
      ) : returns.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="Tidak ada pengajuan retur"
          description="Pengajuan retur dari buyer akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div key={ret.id} className="rounded-card bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/returns/${ret.id}`}
                      className="text-sm font-semibold text-greeva-black hover:text-greeva-starbucks-green"
                    >
                      {ret.return_number}
                    </Link>
                    <Badge variant={STATUS_BADGE[ret.status] ?? 'gray'}>{ret.status_label}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">Pesanan: {ret.order_number}</p>
                  {ret.buyer && (
                    <p className="text-xs text-gray-400">
                      {ret.buyer.name} · {ret.buyer.email}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(ret.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>

              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">
                  Alasan: {RETURN_REASON_LABELS[ret.reason]}
                </p>
                <p className="mt-1 text-sm text-gray-700">{ret.description}</p>
              </div>

              {ret.admin_note && (
                <p className="mt-2 text-xs italic text-gray-500">
                  Catatan admin: {ret.admin_note}
                </p>
              )}

              {ret.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(ret)}
                    disabled={busyId === ret.id}
                    className="rounded-pill bg-greeva-forest px-4 py-2 text-xs font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
                  >
                    {busyId === ret.id ? '...' : 'Setujui & Refund'}
                  </button>
                  <button
                    onClick={() => handleReject(ret)}
                    disabled={busyId === ret.id}
                    className="rounded-pill border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
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
