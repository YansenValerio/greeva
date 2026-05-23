'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { getPartnerProducts, submitPartnerProduct, deletePartnerProduct } from '@/lib/api/partner';
import { toast, confirm } from '@/lib/feedback';
import type { Product } from '@/types/product';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  active: 'green',
  pending_review: 'amber',
  draft: 'gray',
  inactive: 'gray',
  archived: 'gray',
};

export default function PartnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  function load() {
    getPartnerProducts({ per_page: 50 })
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(id: number) {
    setSubmitting(id);
    try {
      const updated = await submitPartnerProduct(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } finally {
      setSubmitting(null);
    }
  }

  async function handleDelete(id: number) {
    const product = products.find((p) => p.id === id);
    const ok = await confirm({
      title: 'Hapus produk?',
      message: `"${product?.name ?? 'Produk ini'}" akan dihapus. Hanya produk berstatus draf atau nonaktif yang dapat dihapus.`,
      confirmText: 'Hapus',
      danger: true,
    });
    if (!ok) return;
    setDeleting(id);
    try {
      await deletePartnerProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Produk dihapus.');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Gagal menghapus produk.');
    } finally {
      setDeleting(null);
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
        title="Produk Saya"
        action={
          <Link
            href="/partner/products/new"
            className="rounded-pill bg-greeva-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green"
          >
            + Tambah Produk
          </Link>
        }
      />

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400">Belum ada produk.</p>
          <Link href="/partner/products/new" className="mt-3 inline-block text-sm text-greeva-starbucks-green hover:underline">
            Tambah produk pertama →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {products.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-greeva-black">{p.name}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Price cents={p.price} className="text-sm text-greeva-forest-dark" />
                  <Badge variant={STATUS_BADGE[p.status] ?? 'gray'}>{p.status_label}</Badge>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {p.status === 'draft' && (
                  <button
                    onClick={() => handleSubmit(p.id)}
                    disabled={submitting === p.id}
                    className="rounded-lg border border-greeva-forest px-3 py-1.5 text-xs font-medium text-greeva-forest hover:bg-greeva-mint-light disabled:opacity-50"
                  >
                    {submitting === p.id ? 'Mengirim...' : 'Submit'}
                  </button>
                )}
                <Link
                  href={`/partner/products/${p.id}/edit`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Edit
                </Link>
                {(p.status === 'draft' || p.status === 'inactive') && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting === p.id ? '...' : 'Hapus'}
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
