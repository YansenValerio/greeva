'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { getPartnerOrders, type PartnerOrder, type PartnerOrderParams } from '@/lib/api/partner';
import type { PaginationMeta } from '@/types/api';

type StatusFilter = '' | 'paid' | 'packing' | 'shipped' | 'delivered' | 'completed';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  paid: 'green', packing: 'green', shipped: 'green',
  delivered: 'green', completed: 'green',
  pending_payment: 'amber', cancelled: 'gray', refunded: 'gray',
};

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Semua', value: '' },
  { label: 'Dibayar', value: 'paid' },
  { label: 'Dikemas', value: 'packing' },
  { label: 'Dikirim', value: 'shipped' },
  { label: 'Diterima', value: 'delivered' },
  { label: 'Selesai', value: 'completed' },
];

export default function PartnerSalesPage() {
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: PartnerOrderParams = { page, per_page: 20 };
    if (status) params.status = status;
    getPartnerOrders(params)
      .then((res) => {
        setOrders(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status]);

  function changeStatus(v: StatusFilter) {
    setStatus(v);
    setPage(1);
  }

  return (
    <div>
      <PageHeader title="Penjualan" />

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
        <ListSkeleton rows={5} height="h-20" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Belum ada penjualan"
          description="Penjualan akan muncul setelah ada pembeli yang memesan produkmu."
        />
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {orders.map((order) => (
            <div key={order.id} className="px-5 py-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-greeva-black">{order.order_number}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={STATUS_BADGE[order.status] ?? 'gray'}>{order.status_label}</Badge>
                  <Price cents={order.grand_total} className="text-sm font-semibold text-greeva-forest-dark" />
                </div>
              </div>
              <div className="space-y-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs text-gray-600">
                    <span>{item.product_name} — {item.variant_name} × {item.quantity}</span>
                    <Price cents={item.subtotal} className="font-medium text-greeva-black" />
                  </div>
                ))}
              </div>
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
