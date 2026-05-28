'use client';

import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { adminGetAuditLogs, type AuditLog } from '@/lib/api/admin';
import type { PaginationMeta } from '@/types/api';

const EVENT_FILTERS = [
  { label: 'Semua', value: '' },
  { label: 'Dibuat', value: 'created' },
  { label: 'Diubah', value: 'updated' },
  { label: 'Ubah Status', value: 'status_changed' },
  { label: 'Dihapus', value: 'deleted' },
];

const EVENT_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  created: 'green',
  status_changed: 'green',
  updated: 'amber',
  deleted: 'gray',
};

const EVENT_LABEL: Record<string, string> = {
  created: 'Dibuat',
  updated: 'Diubah',
  status_changed: 'Ubah Status',
  deleted: 'Dihapus',
};

const TYPE_OPTIONS = [
  { label: 'Semua entitas', value: '' },
  { label: 'Pesanan', value: 'Order' },
  { label: 'Produk', value: 'Product' },
  { label: 'Varian', value: 'ProductVariant' },
  { label: 'Mitra', value: 'Partner' },
  { label: 'Kategori', value: 'Category' },
  { label: 'Payout', value: 'PayoutBatch' },
  { label: 'Earning', value: 'PartnerEarning' },
  { label: 'Ulasan', value: 'ProductReview' },
];

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function DiffView({ log }: { log: AuditLog }) {
  const keys = Array.from(
    new Set([...Object.keys(log.old_values ?? {}), ...Object.keys(log.new_values ?? {})]),
  );

  if (keys.length === 0) {
    return <p className="text-xs text-gray-400">Tidak ada detail perubahan.</p>;
  }

  return (
    <div className="space-y-1.5">
      {keys.map((key) => {
        const before = log.old_values?.[key];
        const after = log.new_values?.[key];
        const changed = formatValue(before) !== formatValue(after);
        return (
          <div key={key} className="grid grid-cols-[120px_1fr] gap-2 text-xs">
            <span className="font-medium text-gray-500">{key}</span>
            <span className="text-greeva-text-body">
              {changed ? (
                <>
                  <span className="text-red-600 line-through">{formatValue(before)}</span>
                  <span className="mx-1.5 text-gray-400">→</span>
                  <span className="text-greeva-forest-dark">{formatValue(after)}</span>
                </>
              ) : (
                <span>{formatValue(after)}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [event, setEvent] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    adminGetAuditLogs({
      page,
      per_page: 30,
      event: event || undefined,
      auditable_type: type || undefined,
    })
      .then((res) => {
        setLogs(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, event, type]);

  function changeEvent(value: string) {
    setEvent(value);
    setPage(1);
  }

  function changeType(value: string) {
    setType(value);
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Riwayat perubahan entitas sensitif (pesanan, payout, produk, mitra) untuk audit & resolusi dispute."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {EVENT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => changeEvent(f.value)}
              className={`rounded-pill px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                event === f.value
                  ? 'bg-greeva-forest text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={type}
          onChange={(e) => changeType(e.target.value)}
          className="rounded-lg border-[1.5px] border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-greeva-forest focus:outline-none"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Tidak ada riwayat"
          description="Audit log untuk entity sensitif (order, payout, mitra) akan muncul di sini."
        />
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {logs.map((log) => {
            const expanded = expandedId === log.id;
            return (
              <div key={log.id} className="px-5 py-4">
                <button
                  onClick={() => setExpandedId(expanded ? null : log.id)}
                  className="flex w-full items-center gap-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={EVENT_BADGE[log.event] ?? 'gray'}>
                        {EVENT_LABEL[log.event] ?? log.event}
                      </Badge>
                      <span className="text-sm font-medium text-greeva-black">
                        {log.auditable_label} #{log.auditable_id}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {log.actor ? log.actor.name : 'Sistem'}
                      {' · '}
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 text-gray-300">{expanded ? '▲' : '▼'}</span>
                </button>

                {expanded && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-4">
                    <DiffView log={log} />
                    {log.ip_address && (
                      <p className="mt-3 text-xs text-gray-400">IP: {log.ip_address}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
