'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  adminGetPayout,
  adminMarkPayoutPaid,
  adminMarkPayoutProcessing,
  adminCancelPayout,
} from '@/lib/api/admin';
import { toast, confirm } from '@/lib/feedback';
import type { PayoutBatch } from '@/types/partner';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  paid: 'green',
  processing: 'amber',
  pending: 'amber',
  cancelled: 'gray',
  failed: 'gray',
};

const EARNING_STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  paid: 'green',
  available: 'green',
  pending: 'amber',
  reversed: 'gray',
};

export default function AdminPayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [batch, setBatch] = useState<PayoutBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProof, setPaymentProof] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetPayout(Number(id))
      .then(setBatch)
      .catch(() => router.push('/admin/payouts'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleProcess() {
    if (!batch) return;
    setSaving(true);
    setError('');
    try {
      const updated = await adminMarkPayoutProcessing(batch.id);
      setBatch(updated);
    } catch {
      setError('Gagal memproses payout.');
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkPaid() {
    if (!batch) return;
    setSaving(true);
    setError('');
    try {
      const updated = await adminMarkPayoutPaid(batch.id, {
        payment_proof: paymentProof || undefined,
        notes: notes || undefined,
      });
      setBatch(updated);
      setPaymentProof('');
      setNotes('');
    } catch {
      setError('Gagal menandai payout sebagai dibayar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!batch) return;
    const ok = await confirm({
      title: 'Batalkan payout?',
      message: 'Earning di dalam batch akan dikembalikan ke status available.',
      confirmText: 'Batalkan',
      danger: true,
    });
    if (!ok) return;
    setSaving(true);
    setError('');
    try {
      const updated = await adminCancelPayout(batch.id);
      setBatch(updated);
      toast.success('Payout dibatalkan.');
    } catch {
      setError('Gagal membatalkan payout.');
      toast.error('Gagal membatalkan payout.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !batch) {
    return <div className="animate-pulse h-96 rounded-card bg-gray-100" />;
  }

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/payouts" className="text-sm text-greeva-starbucks-green hover:underline">
          ← Kembali ke daftar payout
        </Link>
      </div>
      <PageHeader title={batch.payout_number} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Earnings list */}
        <div className="lg:col-span-2">
          <div className="rounded-card bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-greeva-black">Earning dalam Batch</h2>
              <span className="text-sm text-gray-400">{batch.item_count} item</span>
            </div>
            {!batch.items || batch.items.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">Tidak ada data.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {batch.items.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-greeva-black">
                        {e.order_item?.product_name ?? `Order #${e.order_id}`}
                      </p>
                      {e.order_item && (
                        <p className="text-xs text-gray-400">
                          {e.order_item.variant_name} × {e.order_item.quantity}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Price cents={e.amount} className="text-sm font-semibold text-greeva-forest-dark" />
                      <Badge variant={EARNING_STATUS_BADGE[e.status] ?? 'gray'}>{e.status_label}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <span className="font-semibold text-greeva-black">Total</span>
              <Price cents={batch.total_amount} className="font-bold text-greeva-forest-dark" />
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div>
          <div className="rounded-card bg-greeva-sand-warm p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-greeva-black">Status</h2>
              <Badge variant={STATUS_BADGE[batch.status] ?? 'gray'}>{batch.status_label}</Badge>
            </div>

            <dl className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Mitra</dt>
                <dd className="font-medium text-greeva-black">{batch.partner?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Periode</dt>
                <dd className="text-greeva-black">{batch.period_start} – {batch.period_end}</dd>
              </div>
              {batch.paid_at && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Dibayar</dt>
                  <dd className="text-greeva-black">
                    {new Date(batch.paid_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              )}
              {batch.notes && (
                <div className="flex flex-col gap-1">
                  <dt className="text-gray-500">Catatan</dt>
                  <dd className="text-greeva-black">{batch.notes}</dd>
                </div>
              )}
            </dl>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            {batch.status === 'pending' && (
              <div className="space-y-2">
                <button
                  onClick={handleProcess}
                  disabled={saving}
                  className="w-full rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
                >
                  {saving ? 'Memproses...' : 'Tandai: Sedang Diproses'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="w-full rounded-pill border border-red-200 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  Batalkan Payout
                </button>
              </div>
            )}

            {batch.status === 'processing' && (
              <div className="space-y-3">
                <input
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  placeholder="URL bukti transfer (opsional)"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan (opsional)"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
                <button
                  onClick={handleMarkPaid}
                  disabled={saving}
                  className="w-full rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Tandai: Sudah Dibayar'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="w-full rounded-pill border border-red-200 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  Batalkan Payout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
