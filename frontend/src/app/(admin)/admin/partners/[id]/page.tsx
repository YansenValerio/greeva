'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  adminGetPartner,
  adminUpdatePartner,
  adminGetPartnerEarnings,
  type AdminUpdatePartnerPayload,
} from '@/lib/api/admin';
import type { Partner, PartnerEarning } from '@/types/partner';

const EARNING_STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  paid: 'green',
  available: 'green',
  pending: 'amber',
  reversed: 'gray',
};

export default function AdminPartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [earningsMeta, setEarningsMeta] = useState<{ total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [form, setForm] = useState<AdminUpdatePartnerPayload>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const partnerId = Number(id);
    Promise.all([
      adminGetPartner(partnerId),
      adminGetPartnerEarnings(partnerId, { per_page: 10 }),
    ])
      .then(([p, e]) => {
        setPartner(p);
        setEarnings(e.data);
        setEarningsMeta({ total: e.meta?.total ?? e.data.length });
        setForm({
          name: p.name,
          revenue_share_percent: p.revenue_share_percent ?? 80,
          bank_name: p.bank_name ?? '',
          bank_account_number: p.bank_account_number ?? '',
          bank_account_name: p.bank_account_name ?? '',
          is_active: p.is_active,
        });
      })
      .catch(() => router.push('/admin/partners'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSave() {
    if (!partner) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload: AdminUpdatePartnerPayload = {
        name: form.name,
        revenue_share_percent: Number(form.revenue_share_percent),
        bank_name: form.bank_name || null,
        bank_account_number: form.bank_account_number || null,
        bank_account_name: form.bank_account_name || null,
        is_active: form.is_active,
      };
      const updated = await adminUpdatePartner(partner.id, payload);
      setPartner(updated);
      setSuccess('Data mitra berhasil disimpan.');
    } catch {
      setError('Gagal menyimpan data mitra. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !partner) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-48 rounded-card bg-gray-100" />
        <div className="h-64 rounded-card bg-gray-100" />
      </div>
    );
  }

  // Earning totals by status
  const totalByStatus = earnings.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/partners" className="text-sm text-greeva-starbucks-green hover:underline">
          ← Kembali ke daftar mitra
        </Link>
      </div>
      <PageHeader title={partner.name} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main: info + earnings */}
        <div className="space-y-8 lg:col-span-2">

          {/* Partner info */}
          <div className="rounded-card bg-white p-6 shadow-card">
            <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Info Mitra</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-4">
                <dt className="w-36 flex-shrink-0 text-gray-500">Akun</dt>
                <dd className="text-greeva-black">
                  {partner.user ? (
                    <span>
                      {partner.user.name}{' '}
                      <span className="text-gray-400">({partner.user.email})</span>
                    </span>
                  ) : '—'}
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-36 flex-shrink-0 text-gray-500">Slug</dt>
                <dd className="font-mono text-gray-600">{partner.slug}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-36 flex-shrink-0 text-gray-500">Bergabung</dt>
                <dd className="text-greeva-black">
                  {partner.joined_at
                    ? new Date(partner.joined_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-36 flex-shrink-0 text-gray-500">Status</dt>
                <dd>
                  <Badge variant={partner.is_active ? 'green' : 'gray'}>
                    {partner.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-36 flex-shrink-0 text-gray-500">Bagi Hasil</dt>
                <dd className="font-semibold text-greeva-forest-dark">
                  {partner.revenue_share_percent ?? '—'}%
                </dd>
              </div>
              {partner.bank_name && (
                <div className="flex gap-4">
                  <dt className="w-36 flex-shrink-0 text-gray-500">Bank</dt>
                  <dd className="text-greeva-black">{partner.bank_name}</dd>
                </div>
              )}
              {partner.bank_account_number && (
                <div className="flex gap-4">
                  <dt className="w-36 flex-shrink-0 text-gray-500">No. Rekening</dt>
                  <dd className="font-mono text-greeva-black">{partner.bank_account_number}</dd>
                </div>
              )}
              {partner.bank_account_name && (
                <div className="flex gap-4">
                  <dt className="w-36 flex-shrink-0 text-gray-500">Atas Nama</dt>
                  <dd className="text-greeva-black">{partner.bank_account_name}</dd>
                </div>
              )}
              {partner.description && (
                <div className="flex gap-4">
                  <dt className="w-36 flex-shrink-0 text-gray-500">Deskripsi</dt>
                  <dd className="whitespace-pre-line text-gray-600">{partner.description}</dd>
                </div>
              )}
            </dl>

            <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
              <Link
                href={`/admin/products?partner_id=${partner.id}`}
                className="inline-flex items-center gap-1.5 rounded-pill border border-greeva-forest px-4 py-2 text-sm font-medium text-greeva-forest hover:bg-greeva-mint-light transition-colors"
              >
                Lihat Produk Mitra →
              </Link>
              <Link
                href={`/admin/payouts?partner_id=${partner.id}`}
                className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Lihat Payout →
              </Link>
            </div>
          </div>

          {/* Earning summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending', key: 'pending', color: 'text-amber-600' },
              { label: 'Tersedia', key: 'available', color: 'text-greeva-forest-dark' },
              { label: 'Dibayar', key: 'paid', color: 'text-gray-600' },
            ].map(({ label, key, color }) => (
              <div key={key} className="rounded-card bg-white p-4 shadow-card text-center">
                <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
                <Price
                  cents={totalByStatus[key] ?? 0}
                  className={`mt-1 block text-lg font-bold ${color}`}
                />
              </div>
            ))}
          </div>

          {/* Recent earnings */}
          <div className="rounded-card bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-greeva-black">Earning Terbaru</h2>
              {earningsMeta && earningsMeta.total > 10 && (
                <span className="text-xs text-gray-400">{earningsMeta.total} total</span>
              )}
            </div>
            {earnings.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-gray-400">
                Belum ada earning untuk mitra ini.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {earnings.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-greeva-black truncate">
                        {e.order_item?.product_name ?? `Order #${e.order_id}`}
                      </p>
                      {e.order_item && (
                        <p className="text-xs text-gray-400">
                          {e.order_item.variant_name} × {e.order_item.quantity}
                        </p>
                      )}
                      {e.available_at && (
                        <p className="text-xs text-gray-400">
                          Tersedia:{' '}
                          {new Date(e.available_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Price
                        cents={e.amount}
                        className="text-sm font-semibold text-greeva-forest-dark"
                      />
                      <Badge variant={EARNING_STATUS_BADGE[e.status] ?? 'gray'}>
                        {e.status_label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: edit form */}
        <div>
          <div className="rounded-card bg-greeva-sand-warm p-5">
            <h2 className="mb-4 font-semibold text-greeva-black">Edit Data Mitra</h2>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            {success && <p className="mb-3 text-sm text-greeva-forest-dark">{success}</p>}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Nama Mitra</label>
                <input
                  value={form.name ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Bagi Hasil (%)
                </label>
                <input
                  type="number"
                  min={80}
                  max={85}
                  value={form.revenue_share_percent ?? 80}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, revenue_share_percent: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">Min 80%, maks 85%</p>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Info Bank
                </p>
                <div className="space-y-2">
                  <input
                    value={form.bank_name ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
                    placeholder="Nama Bank (mis. BCA)"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                  <input
                    value={form.bank_account_number ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bank_account_number: e.target.value }))
                    }
                    placeholder="Nomor Rekening"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                  <input
                    value={form.bank_account_name ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bank_account_name: e.target.value }))
                    }
                    placeholder="Nama Pemilik Rekening"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.is_active ?? true}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 accent-greeva-forest"
                  />
                  <span className="text-sm text-greeva-black">Mitra Aktif</span>
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50 transition-colors"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
