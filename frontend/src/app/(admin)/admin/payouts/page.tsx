'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  adminGetPayouts,
  adminGeneratePayout,
  adminMarkPayoutProcessing,
  adminCancelPayout,
  type AdminGeneratePayoutPayload,
} from '@/lib/api/admin';
import { adminGetPartners } from '@/lib/api/admin';
import type { PayoutBatch, Partner } from '@/types/partner';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  paid: 'green',
  processing: 'amber',
  pending: 'amber',
  cancelled: 'gray',
  failed: 'gray',
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutBatch[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AdminGeneratePayoutPayload>({
    partner_id: 0,
    period_start: '',
    period_end: '',
  });
  const [generating, setGenerating] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  function load() {
    return adminGetPayouts({ per_page: 50 }).then((res) => setPayouts(res.data));
  }

  useEffect(() => {
    Promise.all([load(), adminGetPartners({ per_page: 100 }).then((res) => setPartners(res.data))])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const batch = await adminGeneratePayout(form);
      setPayouts((prev) => [batch, ...prev]);
      setShowForm(false);
      setForm({ partner_id: 0, period_start: '', period_end: '' });
    } catch {
      alert('Gagal generate payout. Coba lagi.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleProcess(id: number) {
    setActionId(id);
    try {
      const updated = await adminMarkPayoutProcessing(id);
      setPayouts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(id: number) {
    if (!confirm('Batalkan payout ini?')) return;
    setActionId(id);
    try {
      const updated = await adminCancelPayout(id);
      setPayouts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-card bg-gray-100" />)}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Payout"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-pill bg-greeva-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green"
          >
            {showForm ? 'Tutup' : '+ Generate Payout'}
          </button>
        }
      />

      {/* Generate form */}
      {showForm && (
        <div className="mb-8 rounded-card bg-greeva-sand-warm p-6">
          <h2 className="mb-4 font-semibold text-greeva-black">Generate Batch Payout</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Mitra</label>
              <select
                value={form.partner_id}
                onChange={(e) => setForm((f) => ({ ...f, partner_id: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
              >
                <option value={0}>Pilih mitra</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Periode Mulai</label>
              <input
                type="date"
                value={form.period_start}
                onChange={(e) => setForm((f) => ({ ...f, period_start: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Periode Akhir</label>
              <input
                type="date"
                value={form.period_end}
                onChange={(e) => setForm((f) => ({ ...f, period_end: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !form.partner_id || !form.period_start || !form.period_end}
            className="mt-4 rounded-pill bg-greeva-forest px-6 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
          >
            {generating ? 'Memproses...' : 'Generate'}
          </button>
        </div>
      )}

      {payouts.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Belum ada payout.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {payouts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-greeva-black">{p.payout_number}</p>
                  <Badge variant={STATUS_BADGE[p.status] ?? 'gray'}>{p.status_label}</Badge>
                </div>
                <p className="text-xs text-gray-400">
                  {p.partner?.name} · {p.period_start} – {p.period_end} · {p.item_count} item
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Price cents={p.total_amount} className="text-sm font-semibold text-greeva-forest-dark" />
                <Link
                  href={`/admin/payouts/${p.id}`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Detail
                </Link>
                {p.status === 'pending' && (
                  <button
                    onClick={() => handleProcess(p.id)}
                    disabled={actionId === p.id}
                    className="rounded-lg border border-greeva-forest px-3 py-1.5 text-xs font-medium text-greeva-forest hover:bg-greeva-mint-light disabled:opacity-50"
                  >
                    {actionId === p.id ? '...' : 'Proses'}
                  </button>
                )}
                {(p.status === 'pending' || p.status === 'processing') && (
                  <button
                    onClick={() => handleCancel(p.id)}
                    disabled={actionId === p.id}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
