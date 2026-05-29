'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { StarRating } from '@/components/reviews/StarRating';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { ReturnRequestForm } from '@/components/orders/ReturnRequestForm';
import { getCourierTrackUrl } from '@/lib/shipping';
import { getOrder, cancelOrder } from '@/lib/api/orders';
import { toast } from '@/lib/feedback';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from '@/hooks/useHydrated';
import type { Order, OrderItem } from '@/types/order';
import type { Review } from '@/types/review';

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
  const [reviewingItemId, setReviewingItemId] = useState<number | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const [returnOpen, setReturnOpen] = useState(false);

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
            {/* Status timeline */}
            <div className="rounded-card bg-white p-6 shadow-card">
              <h2 className="mb-5 text-h3 font-semibold text-greeva-black">Status Pesanan</h2>
              <OrderTimeline order={order} />
            </div>

            {/* Items */}
            <div className="rounded-card bg-white p-6 shadow-card">
              <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Item Pesanan</h2>
              <div className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    orderNumber={order.order_number}
                    canReview={order.status === 'completed'}
                    isReviewing={reviewingItemId === item.id}
                    onStartReview={() => setReviewingItemId(item.id)}
                    onCancelReview={() => setReviewingItemId(null)}
                    onReviewSaved={(review) => {
                      setOrder((prev) =>
                        prev
                          ? {
                              ...prev,
                              items: prev.items?.map((it) =>
                                it.id === item.id
                                  ? {
                                      ...it,
                                      review: {
                                        id: review.id,
                                        rating: review.rating,
                                        body: review.body,
                                        created_at: review.created_at,
                                      },
                                    }
                                  : it,
                              ),
                            }
                          : prev,
                      );
                      setReviewingItemId(null);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Tracking / Shipment info */}
            {order.shipments && order.shipments.some((s) => s.tracking_number) && (
              <div className="rounded-card bg-white p-6 shadow-card">
                <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Pelacakan Pengiriman</h2>
                <div className="space-y-3">
                  {order.shipments
                    .filter((s) => s.tracking_number)
                    .map((s) => {
                      const trackUrl = getCourierTrackUrl(s.courier, s.tracking_number);
                      return (
                        <div
                          key={s.id}
                          className="rounded-lg bg-greeva-mint-light/50 p-4"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div>
                              <p className="text-xs uppercase tracking-wider text-greeva-forest-dark/70">
                                Kurir
                              </p>
                              <p className="text-sm font-semibold text-greeva-forest-dark">
                                {s.courier ?? '—'}
                                {s.courier_service && (
                                  <span className="font-normal text-gray-600">
                                    {' '}({s.courier_service})
                                  </span>
                                )}
                              </p>
                            </div>
                            {trackUrl && (
                              <a
                                href={trackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-pill border border-greeva-forest px-3 py-1 text-xs font-medium text-greeva-forest hover:bg-white transition-colors"
                              >
                                Lacak di situs kurir ↗
                              </a>
                            )}
                          </div>
                          <div className="mt-3 border-t border-greeva-mint/40 pt-3">
                            <p className="text-xs uppercase tracking-wider text-greeva-forest-dark/70">
                              Nomor Resi
                            </p>
                            <p className="mt-1 select-all font-mono text-base font-semibold text-greeva-black">
                              {s.tracking_number}
                            </p>
                          </div>
                          {(s.shipped_at || s.delivered_at) && (
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-greeva-forest-dark/70">
                              {s.shipped_at && (
                                <span>
                                  Dikirim:{' '}
                                  {new Date(s.shipped_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                              {s.delivered_at && (
                                <span>
                                  Diterima:{' '}
                                  {new Date(s.delivered_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

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

              {/* Cancel order */}
              {order.can_be_cancelled && !cancelOpen && (
                <button
                  onClick={() => setCancelOpen(true)}
                  className="mt-3 block w-full rounded-pill border border-red-200 py-2.5 text-center text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Batalkan Pesanan
                </button>
              )}

              {cancelOpen && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50/60 p-4">
                  <p className="mb-2 text-sm font-semibold text-red-900">
                    Yakin ingin membatalkan?
                  </p>
                  <p className="mb-3 text-xs text-red-700">
                    Stok produk akan dikembalikan
                    {order.status === 'paid' || order.status === 'packing'
                      ? '. Dana yang sudah dibayar akan di-refund dalam 3–7 hari kerja.'
                      : '.'}
                  </p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Alasan (opsional)"
                    rows={2}
                    maxLength={500}
                    disabled={cancelling}
                    className="mb-3 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none disabled:opacity-50"
                  />
                  {cancelError && (
                    <p className="mb-2 text-xs text-red-700">{cancelError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setCancelling(true);
                        setCancelError('');
                        try {
                          const updated = await cancelOrder(
                            order.order_number,
                            cancelReason.trim() || undefined,
                          );
                          setOrder(updated);
                          setCancelOpen(false);
                          setCancelReason('');
                        } catch (e) {
                          const msg = (e as { response?: { data?: { message?: string } } })
                            ?.response?.data?.message;
                          setCancelError(msg ?? 'Gagal membatalkan pesanan.');
                        } finally {
                          setCancelling(false);
                        }
                      }}
                      disabled={cancelling}
                      className="flex-1 rounded-pill bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {cancelling ? 'Membatalkan...' : 'Ya, batalkan'}
                    </button>
                    <button
                      onClick={() => {
                        setCancelOpen(false);
                        setCancelReason('');
                        setCancelError('');
                      }}
                      disabled={cancelling}
                      className="flex-1 rounded-pill border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Jangan jadi
                    </button>
                  </div>
                </div>
              )}

              {/* Ajukan retur */}
              {order.can_request_return && !returnOpen && (
                <button
                  onClick={() => setReturnOpen(true)}
                  className="mt-3 block w-full rounded-pill border border-amber-300 py-2.5 text-center text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  Ajukan Retur
                </button>
              )}

              {returnOpen && (
                <ReturnRequestForm
                  orderNumber={order.order_number}
                  onSuccess={() => {
                    setReturnOpen(false);
                    setOrder((prev) => (prev ? { ...prev, can_request_return: false } : prev));
                    toast.success('Pengajuan retur terkirim. Admin akan meninjau dalam 1×24 jam.');
                  }}
                  onCancel={() => setReturnOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

// ── ItemRow ──────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: OrderItem;
  orderNumber: string;
  canReview: boolean;
  isReviewing: boolean;
  onStartReview: () => void;
  onCancelReview: () => void;
  onReviewSaved: (review: Review) => void;
}

function ItemRow({
  item,
  orderNumber,
  canReview,
  isReviewing,
  onStartReview,
  onCancelReview,
  onReviewSaved,
}: ItemRowProps) {
  const hasReview = item.review != null;

  return (
    <div className="py-4">
      <div className="flex gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-greeva-mint-light">
          {item.product_image ? (
            <Image
              src={item.product_image}
              alt={item.product_name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex-1">
          {item.product_slug ? (
            <Link
              href={`/products/${item.product_slug}`}
              className="font-medium text-greeva-black hover:text-greeva-starbucks-green transition-colors"
            >
              {item.product_name}
            </Link>
          ) : (
            <p className="font-medium text-greeva-black">{item.product_name}</p>
          )}
          <p className="text-sm text-gray-500">
            {item.variant_name} — {item.quantity}×{' '}
            <Price cents={item.unit_price} className="inline" />
          </p>

          {/* Review existing */}
          {hasReview && !isReviewing && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-greeva-mint-light/60 px-3 py-1.5">
              <StarRating value={item.review!.rating} size={12} />
              <span className="text-xs text-greeva-forest-dark">Sudah diulas</span>
              <button
                onClick={onStartReview}
                className="ml-1 text-xs font-medium text-greeva-starbucks-green hover:underline"
              >
                Edit
              </button>
            </div>
          )}

          {/* CTA tulis ulasan */}
          {canReview && !hasReview && !isReviewing && (
            <button
              onClick={onStartReview}
              className="mt-2 inline-flex items-center gap-1.5 rounded-pill border border-greeva-forest px-3 py-1 text-xs font-medium text-greeva-forest hover:bg-greeva-mint-light transition-colors"
            >
              ✦ Tulis Ulasan
            </button>
          )}
        </div>
        <Price
          cents={item.subtotal}
          className="flex-shrink-0 text-sm font-semibold text-greeva-forest-dark"
        />
      </div>

      {/* Inline review form */}
      {isReviewing && (
        <div className="mt-4 rounded-card bg-greeva-sand-warm p-4">
          <p className="mb-3 text-sm font-medium text-greeva-black">
            {hasReview ? 'Edit ulasan' : 'Tulis ulasan'} untuk{' '}
            <span className="text-greeva-forest-dark">{item.product_name}</span>
          </p>
          <ReviewForm
            orderNumber={orderNumber}
            itemId={item.id}
            existing={item.review ?? null}
            onSuccess={onReviewSaved}
            onCancel={onCancelReview}
          />
        </div>
      )}
    </div>
  );
}
