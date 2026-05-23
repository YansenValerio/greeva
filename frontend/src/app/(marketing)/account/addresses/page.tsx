'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from '@/hooks/useHydrated';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/lib/api/addresses';
import { toast, confirm } from '@/lib/feedback';
import type { Address, AddressPayload } from '@/types/address';

interface FormState {
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  is_default: boolean;
}

const EMPTY_FORM: FormState = {
  label: '',
  recipient_name: '',
  phone: '',
  address: '',
  province: '',
  city: '',
  district: '',
  postal_code: '',
  is_default: false,
};

export default function AccountAddressesPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login?next=/account/addresses');
      return;
    }
    void load();
  }, [hydrated, isAuthenticated, router]);

  async function load() {
    setLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch {
      setError('Gagal memuat alamat.');
    } finally {
      setLoading(false);
    }
  }

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? '',
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address: addr.address,
      province: addr.province,
      city: addr.city,
      district: addr.district ?? '',
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });
    setShowForm(true);
    setError('');
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload: AddressPayload = {
      label: form.label.trim() || null,
      recipient_name: form.recipient_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      province: form.province.trim(),
      city: form.city.trim(),
      district: form.district.trim() || null,
      postal_code: form.postal_code.trim(),
      is_default: form.is_default,
    };

    try {
      if (editingId) {
        await updateAddress(editingId, payload);
        toast.success('Alamat berhasil diperbarui.');
      } else {
        await createAddress(payload);
        toast.success('Alamat baru ditambahkan.');
      }
      resetForm();
      await load();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Gagal menyimpan alamat.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(addr: Address) {
    const ok = await confirm({
      title: 'Hapus alamat?',
      message: `Alamat "${addr.label ?? addr.recipient_name}" akan dihapus permanen.`,
      confirmText: 'Hapus',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteAddress(addr.id);
      toast.success('Alamat dihapus.');
      await load();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Gagal menghapus alamat.');
    }
  }

  async function handleSetDefault(addr: Address) {
    try {
      await setDefaultAddress(addr.id);
      toast.success('Alamat default berhasil diubah.');
      await load();
    } catch {
      toast.error('Gagal menetapkan default.');
    }
  }

  if (!hydrated || loading) {
    return (
      <main className="py-10 md:py-14">
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="h-32 rounded-card bg-gray-100" />
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="mb-2">
          <Link href="/account" className="text-sm text-greeva-starbucks-green hover:underline">
            ← Kembali ke Akun
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold text-greeva-black">Alamat Tersimpan</h1>
            <p className="mt-1 text-sm text-gray-500">
              Simpan alamat untuk checkout lebih cepat.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={startAdd}
              className="rounded-pill bg-greeva-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green transition-colors"
            >
              + Tambah Alamat
            </button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-card bg-greeva-sand-warm p-6"
          >
            <h2 className="mb-4 text-h3 font-semibold text-greeva-black">
              {editingId ? 'Edit Alamat' : 'Tambah Alamat Baru'}
            </h2>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-greeva-black">
                  Label <span className="font-normal text-gray-400">(mis. Rumah, Kantor)</span>
                </label>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  maxLength={50}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Nama Penerima
                  </label>
                  <input
                    value={form.recipient_name}
                    onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-greeva-black">
                  Alamat Lengkap
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  rows={3}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Provinsi
                  </label>
                  <input
                    value={form.province}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Kota / Kabupaten
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Kecamatan <span className="font-normal text-gray-400">(opsional)</span>
                  </label>
                  <input
                    value={form.district}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-greeva-black">
                    Kode Pos
                  </label>
                  <input
                    value={form.postal_code}
                    onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                    maxLength={5}
                    pattern="\d{5}"
                    placeholder="12345"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 accent-greeva-forest"
                />
                <span className="text-sm text-greeva-black">Jadikan alamat default</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-pill bg-greeva-forest px-6 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Alamat'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-pill border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="rounded-card bg-white py-16 text-center shadow-card">
            <p className="text-sm text-gray-400">
              Belum ada alamat tersimpan. Tambahkan alamat untuk checkout lebih cepat.
            </p>
            <button
              onClick={startAdd}
              className="mt-4 rounded-pill bg-greeva-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green"
            >
              + Tambah Alamat Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((addr) => (
              <article
                key={addr.id}
                className={`relative rounded-card bg-white p-5 shadow-card ${
                  addr.is_default ? 'ring-2 ring-greeva-forest' : ''
                }`}
              >
                {addr.is_default && (
                  <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-greeva-mint-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-greeva-forest-dark">
                    Default
                  </span>
                )}

                {addr.label && (
                  <p className="text-caption font-bold uppercase tracking-wider text-greeva-starbucks-green">
                    {addr.label}
                  </p>
                )}
                <p className="mt-1 font-semibold text-greeva-black">{addr.recipient_name}</p>
                <p className="text-sm text-gray-600">{addr.phone}</p>
                <p className="mt-2 text-sm text-gray-700">{addr.address}</p>
                <p className="text-sm text-gray-700">
                  {addr.district ? `${addr.district}, ` : ''}
                  {addr.city}, {addr.province} {addr.postal_code}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr)}
                      className="rounded-pill border border-greeva-forest px-3 py-1 text-xs font-medium text-greeva-forest hover:bg-greeva-mint-light transition-colors"
                    >
                      Jadikan Default
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(addr)}
                    className="rounded-pill border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr)}
                    className="rounded-pill border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
