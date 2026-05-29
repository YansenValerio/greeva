'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { adminGetProduct, adminUpdateProductStatus, adminToggleFeatured } from '@/lib/api/admin';
import { toast } from '@/lib/feedback';
import type { Product } from '@/types/product';

const PRODUCT_STATUSES = [
  { value: 'pending_review', label: 'Menunggu Review' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
  { value: 'archived', label: 'Arsip' },
];

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  active: 'green',
  pending_review: 'amber',
  draft: 'gray',
  inactive: 'gray',
  archived: 'gray',
};

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [togglingFeatured, setTogglingFeatured] = useState(false);

  async function handleToggleFeatured() {
    if (!product) return;
    setTogglingFeatured(true);
    try {
      const updated = await adminToggleFeatured(product.id);
      setProduct(updated);
      toast.success(updated.is_featured ? 'Ditambahkan ke Pilihan.' : 'Dilepas dari Pilihan.');
    } catch {
      toast.error('Gagal mengubah status pilihan.');
    } finally {
      setTogglingFeatured(false);
    }
  }

  useEffect(() => {
    adminGetProduct(Number(id))
      .then((p) => { setProduct(p); setNewStatus(p.status); })
      .catch(() => router.push('/admin/products'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleStatusUpdate() {
    if (!product) return;
    setSaving(true);
    setError('');
    try {
      const updated = await adminUpdateProductStatus(product.id, { status: newStatus, note: note || undefined });
      setProduct(updated);
      setNote('');
    } catch {
      setError('Gagal mengubah status. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !product) {
    return <div className="animate-pulse h-96 rounded-card bg-gray-100" />;
  }

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/products" className="text-sm text-greeva-starbucks-green hover:underline">
          ← Kembali ke daftar produk
        </Link>
      </div>
      <PageHeader title={product.name} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Detail */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-card bg-white p-6 shadow-card">
            <dl className="space-y-3 text-sm">
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Mitra</dt>
                <dd className="text-greeva-black">{product.partner?.name ?? '—'}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Kategori</dt>
                <dd className="text-greeva-black">{product.category?.name ?? '—'}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Harga</dt>
                <dd><Price cents={product.price} className="text-greeva-black" /></dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Stok Total</dt>
                <dd className="text-greeva-black">{product.total_stock}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Berat</dt>
                <dd className="text-greeva-black">{product.weight ? `${product.weight} gram` : '—'}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Material</dt>
                <dd className="text-greeva-black">{product.material ?? '—'}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Status</dt>
                <dd><Badge variant={STATUS_BADGE[product.status] ?? 'gray'}>{product.status_label}</Badge></dd>
              </div>
            </dl>

            {product.description && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="mb-1 text-sm font-medium text-greeva-black">Deskripsi</p>
                <p className="whitespace-pre-line text-sm text-gray-600">{product.description}</p>
              </div>
            )}

            {product.sustainability_notes && (
              <div className="mt-4 rounded-lg bg-greeva-mint-light p-4">
                <p className="text-sm font-medium text-greeva-forest-dark">Catatan Keberlanjutan</p>
                <p className="mt-1 text-sm text-greeva-forest-dark/80">{product.sustainability_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status update */}
        <div className="space-y-4">
          {/* Featured toggle */}
          <div className="rounded-card bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-greeva-black">Produk Pilihan</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Ditampilkan di halaman utama
                </p>
              </div>
              <button
                onClick={handleToggleFeatured}
                disabled={togglingFeatured}
                className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  product.is_featured
                    ? 'bg-greeva-forest text-white hover:bg-greeva-starbucks-green'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {togglingFeatured ? '...' : product.is_featured ? '★ Pilihan' : 'Jadikan Pilihan'}
              </button>
            </div>
          </div>

          <div className="rounded-card bg-greeva-sand-warm p-5">
            <h2 className="mb-4 font-semibold text-greeva-black">Ubah Status</h2>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
              >
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan (opsional)"
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
              />

              <button
                onClick={handleStatusUpdate}
                disabled={saving || newStatus === product.status}
                className="w-full rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

