'use client';

import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/Skeleton';
import {
  adminGetVouchers,
  adminCreateVoucher,
  adminUpdateVoucher,
  adminDeleteVoucher,
} from '@/lib/api/admin';
import { toast, confirm } from '@/lib/feedback';
import type { Voucher, VoucherType, AdminVoucherPayload } from '@/types/voucher';

interface FormState {
  code: string;
  description: string;
  type: VoucherType;
  value: string;        // persen, atau rupiah (utk fixed)
  max_discount: string; // rupiah (percent only)
  min_purchase: string; // rupiah
  valid_from: string;   // YYYY-MM-DD
  valid_until: string;
  usage_limit: string;
  per_user_limit: string;
  first_order_only: boolean;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  code: '',
  description: '',
  type: 'percent',
  value: '',
  max_discount: '',
  min_purchase: '',
  valid_from: '',
  valid_until: '',
  usage_limit: '',
  per_user_limit: '',
  first_order_only: false,
  is_active: true,
};

// Rupiah (input) → sen (API). Kosong → null.
function toCents(rupiah: string): number | null {
  const n = parseInt(rupiah, 10);
  return Number.isFinite(n) && rupiah.trim() !== '' ? n * 100 : null;
}
function toRupiah(cents: number | null): string {
  return cents != null ? String(Math.round(cents / 100)) : '';
}
function toIntOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && v.trim() !== '' ? n : null;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminGetVouchers({ per_page: 100 });
      setVouchers(res.data);
    } catch {
      setError('Gagal memuat voucher.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(v: Voucher) {
    setEditingId(v.id);
    setForm({
      code: v.code,
      description: v.description ?? '',
      type: v.type,
      value: v.type === 'fixed' ? toRupiah(v.value) : String(v.value),
      max_discount: toRupiah(v.max_discount),
      min_purchase: toRupiah(v.min_purchase),
      valid_from: v.valid_from ? v.valid_from.slice(0, 10) : '',
      valid_until: v.valid_until ? v.valid_until.slice(0, 10) : '',
      usage_limit: v.usage_limit != null ? String(v.usage_limit) : '',
      per_user_limit: v.per_user_limit != null ? String(v.per_user_limit) : '',
      first_order_only: v.first_order_only,
      is_active: v.is_active,
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload: AdminVoucherPayload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      type: form.type,
      // percent → persen apa adanya; fixed → rupiah ke sen
      value: form.type === 'fixed' ? (toCents(form.value) ?? 0) : (toIntOrNull(form.value) ?? 0),
      max_discount: form.type === 'percent' ? toCents(form.max_discount) : null,
      min_purchase: toCents(form.min_purchase) ?? 0,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      usage_limit: toIntOrNull(form.usage_limit),
      per_user_limit: toIntOrNull(form.per_user_limit),
      first_order_only: form.first_order_only,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminUpdateVoucher(editingId, payload);
        toast.success('Voucher diperbarui.');
      } else {
        await adminCreateVoucher(payload);
        toast.success('Voucher dibuat.');
      }
      resetForm();
      await load();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Gagal menyimpan voucher.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(v: Voucher) {
    const ok = await confirm({
      title: 'Hapus voucher?',
      message: `Voucher ${v.code} akan dihapus.`,
      danger: true,
      confirmText: 'Hapus',
    });
    if (!ok) return;
    try {
      await adminDeleteVoucher(v.id);
      setVouchers((prev) => prev.filter((x) => x.id !== v.id));
      toast.success('Voucher dihapus.');
    } catch {
      toast.error('Gagal menghapus voucher.');
    }
  }

  return (
    <div>
      <PageHeader title="Voucher" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 rounded-card bg-greeva-sand-warm p-5 lg:col-span-1">
          <h2 className="font-semibold text-greeva-black">
            {editingId ? 'Edit Voucher' : 'Voucher Baru'}
          </h2>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Field label="Kode">
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm uppercase focus:border-greeva-forest focus:outline-none"
            />
          </Field>

          <Field label="Deskripsi (opsional)">
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Tipe">
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as VoucherType }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
              >
                <option value="percent">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </Field>
            <Field label={form.type === 'percent' ? 'Nilai (%)' : 'Nominal (Rp)'}>
              <input
                type="number"
                min={1}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
              />
            </Field>
          </div>

          {form.type === 'percent' && (
            <Field label="Maks. potongan (Rp, opsional)">
              <input
                type="number"
                min={0}
                value={form.max_discount}
                onChange={(e) => setForm((f) => ({ ...f, max_discount: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
              />
            </Field>
          )}

          <Field label="Min. belanja (Rp, opsional)">
            <input
              type="number"
              min={0}
              value={form.min_purchase}
              onChange={(e) => setForm((f) => ({ ...f, min_purchase: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Berlaku dari">
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
              />
            </Field>
            <Field label="Berlaku sampai">
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Kuota total (opsional)">
              <input
                type="number"
                min={1}
                value={form.usage_limit}
                onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
              />
            </Field>
            <Field label="Batas per user (opsional)">
              <input
                type="number"
                min={1}
                value={form.per_user_limit}
                onChange={(e) => setForm((f) => ({ ...f, per_user_limit: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-greeva-black">
            <input
              type="checkbox"
              checked={form.first_order_only}
              onChange={(e) => setForm((f) => ({ ...f, first_order_only: e.target.checked }))}
            />
            Khusus pelanggan baru
          </label>
          <label className="flex items-center gap-2 text-sm text-greeva-black">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Aktif
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : editingId ? 'Simpan' : 'Buat Voucher'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-pill border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="lg:col-span-2">
          {loading ? (
            <ListSkeleton rows={4} height="h-20" />
          ) : vouchers.length === 0 ? (
            <EmptyState icon={Ticket} title="Belum ada voucher" description="Buat voucher pertama lewat form di samping." />
          ) : (
            <div className="space-y-3">
              {vouchers.map((v) => (
                <div key={v.id} className="rounded-card bg-white p-4 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-greeva-black">{v.code}</span>
                        <Badge variant={v.is_active ? 'green' : 'gray'}>
                          {v.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        {v.first_order_only && <Badge variant="amber">Pelanggan baru</Badge>}
                      </div>
                      {v.description && <p className="mt-0.5 text-xs text-gray-500">{v.description}</p>}
                      <p className="mt-1 text-sm text-greeva-forest-dark">
                        Potongan <span className="font-semibold">{v.discount_label}</span>
                        {v.max_discount_formatted && ` (maks. ${v.max_discount_formatted})`}
                        {v.min_purchase > 0 && ` · min. ${v.min_purchase_formatted}`}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {v.usage_limit != null ? `Kuota ${v.usage_limit}` : 'Kuota tak terbatas'}
                        {v.per_user_limit != null && ` · ${v.per_user_limit}×/user`}
                        {v.valid_until && ` · s/d ${new Date(v.valid_until).toLocaleDateString('id-ID')}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(v)}
                        className="rounded-pill border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        className="rounded-pill border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}
