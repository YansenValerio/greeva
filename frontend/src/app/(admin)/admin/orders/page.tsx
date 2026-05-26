'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { adminGetOrders, adminBulkUpdateOrderStatus } from '@/lib/api/admin';
import { toast, confirm } from '@/lib/feedback';
import type { Order } from '@/types/order';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  paid: 'green',
  packing: 'green',
  shipped: 'green',
  delivered: 'green',
  completed: 'green',
  pending_payment: 'amber',
  payment_failed: 'gray',
  cancelled: 'gray',
  refunded: 'gray',
};

const STATUS_FILTERS = [
  { label: 'Semua', value: '' },
  { label: 'Bayar', value: 'pending_payment' },
  { label: 'Paid', value: 'paid' },
  { label: 'Packing', value: 'packing' },
  { label: 'Dikirim', value: 'shipped' },
  { label: 'Diterima', value: 'delivered' },
  { label: 'Selesai', value: 'completed' },
];

const BULK_ACTIONS: { label: string; value: string }[] = [
  { label: 'Tandai Dikemas', value: 'packing' },
  { label: 'Tandai Diterima', value: 'delivered' },
  { label: 'Tandai Selesai', value: 'completed' },
  { label: 'Batalkan', value: 'cancelled' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('packing');
  const [applying, setApplying] = useState(false);

  function load() {
    setLoading(true);
    adminGetOrders({ per_page: 50, status: status || undefined })
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setSelected(new Set());
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === orders.length ? new Set() : new Set(orders.map((o) => o.id)),
    );
  }

  async function applyBulk() {
    const ids = [...selected];
    if (ids.length === 0) return;

    const label = BULK_ACTIONS.find((a) => a.value === bulkStatus)?.label ?? bulkStatus;
    const ok = await confirm({
      title: `${label} — ${ids.length} pesanan?`,
      message:
        bulkStatus === 'cancelled'
          ? 'Pesanan akan dibatalkan dan stok dikembalikan. Tindakan ini tidak bisa dibatalkan.'
          : 'Perubahan status akan diterapkan ke pesanan terpilih yang transisinya valid.',
      danger: bulkStatus === 'cancelled',
    });
    if (!ok) return;

    setApplying(true);
    try {
      const res = await adminBulkUpdateOrderStatus({ order_ids: ids, status: bulkStatus });
      if (res.updated.length > 0) {
        toast.success(`${res.updated.length} pesanan diperbarui.`);
      }
      if (res.failed.length > 0) {
        toast.info(`${res.failed.length} pesanan dilewati (transisi tidak valid).`);
      }
      setSelected(new Set());
      load();
    } catch {
      toast.error('Gagal memperbarui pesanan.');
    } finally {
      setApplying(false);
    }
  }

  const allChecked = orders.length > 0 && selected.size === orders.length;

  return (
    <div>
      <PageHeader title="Pesanan" />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card bg-greeva-mint-light px-4 py-3">
          <span className="text-sm font-medium text-greeva-forest-dark">
            {selected.size} terpilih
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-lg border-[1.5px] border-greeva-forest/30 bg-white px-3 py-1.5 text-sm focus:border-greeva-forest focus:outline-none"
          >
            {BULK_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <button
            onClick={applyBulk}
            disabled={applying}
            className="rounded-pill bg-greeva-forest px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-greeva-starbucks-green disabled:opacity-50"
          >
            {applying ? 'Memproses…' : 'Terapkan'}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-greeva-forest-dark/70 hover:underline"
          >
            Batal
          </button>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-card bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Tidak ada pesanan.</p>
      ) : (
        <div className="rounded-card bg-white shadow-card">
          <label className="flex items-center gap-3 border-b border-gray-100 px-5 py-3 text-xs font-medium uppercase tracking-[0.08em] text-gray-400">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 text-greeva-forest focus:ring-greeva-leaf"
            />
            Pilih semua
          </label>
          <div className="divide-y divide-gray-100">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-4">
                <input
                  type="checkbox"
                  checked={selected.has(o.id)}
                  onChange={() => toggle(o.id)}
                  className="h-4 w-4 rounded border-gray-300 text-greeva-forest focus:ring-greeva-leaf"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-greeva-black">{o.order_number}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(o.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {' · '}
                    {o.shipping_name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Price cents={o.grand_total} className="text-sm font-semibold text-greeva-forest-dark" />
                  <Badge variant={STATUS_BADGE[o.status] ?? 'gray'}>{o.status_label}</Badge>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Kelola
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
