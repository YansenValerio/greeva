'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { getOrder } from '@/lib/api/orders';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from '@/hooks/useHydrated';
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

export default function OrderDetailPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push(`/login?next=/orders/${orderNumber}`);
      return;
    }
    getOrder(orderNumber)
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated, orderNumber, router]);

  if (!hydrated || loading) {
    return (
      <main className="py-10 md:py-14">
        <Container>
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="h-40 rounded-card bg-gray-100" />
            <div className="h-60 rounded-card bg-gray-100" />
          </div>
        </Container>
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="flex min-h-[50vh] items-center">
        <Container>
          <div className="text-center">
            <p className="text-lg text-gray-500">Pesanan tidak ditemukan.</p>
            <Link href="/orders" className="mt-3 inline-block text-sm text-greeva-starbucks-green hover:underline">
              ← Kembali ke daftar pesanan
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/orders" className="hover:text-greeva-starbucks-green transition-colors">
            Pesanan Saya
          </Link>
          <span>/</span>
          <span className="text-greeva-black">{order.order_number}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold text-greeva-black">{order.order_number}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Badge variant={STATUS_BADGE[order.status] ?? 'gray'}>{order.status_label}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items + shipping */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items */}
            <div className="rounded-card bg-white p-6 shadow-card">
              <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Item Pesanan</h2>
              <div className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-greeva-mint-light">
                      {item.product_image ? (
                        <Image src={item.product_image} alt={item.product_name} fill sizes="64px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-greeva-black">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {item.variant_name} — {item.quantity}×{' '}
                        <Price cents={item.unit_price} className="inline" />
                      </p>
                    </div>
                    <Price cents={item.subtotal} className="flex-shrink-0 text-sm font-semibold text-greeva-forest-dark" />
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="rounded-card bg-white p-6 shadow-card">
              <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Alamat Pengiriman</h2>
              <address className="space-y-1 text-sm not-italic text-gray-700">
                <p className="font-medium text-greeva-black">{order.shipping_name}</p>
                <p>{order.shipping_phone}</p>
                <p>{order.shipping_address}</p>
                <p>
                  {order.shipping_district ? `${order.shipping_district}, ` : ''}
                  {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                </p>
              </address>
              {order.notes && (
                <p className="mt-3 text-sm text-gray-600">
                  <span className="font-medium">Catatan:</span> {order.notes}
                </p>
              )}
            </div>
          </div>

          {/* Payment summary */}
          <div>
            <div className="rounded-card bg-greeva-sand-warm p-6">
              <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Ringkasan Pembayaran</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd><Price cents={order.subtotal} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Ongkos kirim</dt>
                  <dd><Price cents={order.shipping_total} /></dd>
                </div>
                {order.discount_total > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Diskon</dt>
                    <dd>− <Price cents={order.discount_total} /></dd>
                  </div>
                )}
              </dl>
              <div className="my-4 border-t border-gray-200" />
              <div className="flex justify-between font-bold">
                <span className="text-greeva-black">Total</span>
                <Price cents={order.grand_total} className="text-greeva-forest-dark" />
              </div>

              {order.status === 'pending_payment' && order.payment_url && (
                <a
                  href={order.payment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 block w-full rounded-pill bg-greeva-forest py-3 text-center text-sm font-semibold text-white transition-all hover:bg-greeva-starbucks-green"
                >
                  Selesaikan Pembayaran
                </a>
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
