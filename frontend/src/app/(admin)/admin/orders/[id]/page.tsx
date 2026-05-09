'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { adminGetOrder, adminUpdateOrderStatus } from '@/lib/api/admin';
import type { Order } from '@/types/order';

const ORDER_STATUSES = [
  { value: 'paid', label: 'Paid' },
  { value: 'packing', label: 'Packing' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Diterima' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'refunded', label: 'Refunded' },
];

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

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetOrder(Number(id))
      .then((o) => { setOrder(o); setNewStatus(o.status); })
      .catch(() => router.push('/admin/orders'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleStatusUpdate() {
    if (!order) return;
    setSaving(true);
    setError('');
    try {
      const payload: { status: string; tracking_number?: string } = { status: newStatus };
      if (newStatus === 'shipped' && trackingNumber) {
        payload.tracking_number = trackingNumber;
      }
      const updated = await adminUpdateOrderStatus(order.id, payload);
      setOrder(updated);
      setTrackingNumber('');
    } catch {
      setError('Gagal mengubah status. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !order) {
    return <div className="animate-pulse h-96 rounded-card bg-gray-100" />;
  }

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/orders" className="text-sm text-greeva-starbucks-green hover:underline">
          ← Kembali ke daftar pesanan
        </Link>
      </div>
      <PageHeader title={order.order_number} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-card bg-white p-6 shadow-card">
            <h2 className="mb-4 font-semibold text-greeva-black">Item Pesanan</h2>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-greeva-mint-light">
                    {item.product_image && (
                      <Image src={item.product_image} alt={item.product_name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-greeva-black">{item.product_name}</p>
                    <p className="text-xs text-gray-400">
                      {item.variant_name} × {item.quantity}
                    </p>
                  </div>
                  <Price cents={item.subtotal} className="text-sm font-semibold text-greeva-forest-dark" />
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-card bg-white p-6 shadow-card">
            <h2 className="mb-4 font-semibold text-greeva-black">Pengiriman</h2>
            <address className="space-y-1 text-sm not-italic text-gray-700">
              <p className="font-medium text-greeva-black">{order.shipping_name}</p>
              <p>{order.shipping_phone}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_district ? `${order.shipping_district}, ` : ''}
                {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
              </p>
            </address>
            {order.shipments && order.shipments.length > 0 && (
              <div className="mt-4 space-y-2">
                {order.shipments.map((s) => (
                  <p key={s.id} className="text-sm text-gray-600">
                    {s.carrier && <span className="font-medium">{s.carrier} · </span>}
                    Resi: {s.tracking_number ?? '—'}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Payment summary */}
          <div className="rounded-card bg-white p-6 shadow-card">
            <h2 className="mb-4 font-semibold text-greeva-black">Ringkasan Pembayaran</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd><Price cents={order.subtotal} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Ongkos Kirim</dt>
                <dd><Price cents={order.shipping_total} /></dd>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Diskon</dt>
                  <dd>− <Price cents={order.discount_total} /></dd>
                </div>
              )}
            </dl>
            <div className="my-3 border-t border-gray-100" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <Price cents={order.grand_total} className="text-greeva-forest-dark" />
            </div>
          </div>
        </div>

        {/* Status update panel */}
        <div>
          <div className="rounded-card bg-greeva-sand-warm p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-greeva-black">Status</h2>
              <Badge variant={STATUS_BADGE[order.status] ?? 'gray'}>{order.status_label}</Badge>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {newStatus === 'shipped' && (
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Nomor resi pengiriman"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
              )}

              <button
                onClick={handleStatusUpdate}
                disabled={saving || newStatus === order.status}
                className="w-full rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
