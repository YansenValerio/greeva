'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { adminGetOrders } from '@/lib/api/admin';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminGetOrders({ per_page: 50, status: status || undefined })
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

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

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-card bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Tidak ada pesanan.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center gap-4 px-5 py-4">
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
      )}
    </div>
  );
}
