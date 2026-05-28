'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton, ListSkeleton } from '@/components/shared/Skeleton';
import { getPartnerProducts, submitPartnerProduct, deletePartnerProduct } from '@/lib/api/partner';
import { toast, confirm } from '@/lib/feedback';
import type { Product } from '@/types/product';
import type { PaginationMeta } from '@/types/api';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  active: 'green',
  pending_review: 'amber',
  draft: 'gray',
  inactive: 'gray',
  archived: 'gray',
};

export default function PartnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  function load() {
    setLoading(true);
    getPartnerProducts({ per_page: 20, page })
      .then((res) => {
        setProducts(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <ListSkeleton rows={4} />
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
        <EmptyState
          icon={Package}
          title="Belum ada produk"
          description="Mulai dengan menambah produk pertamamu untuk dijual via Greeva."
          action={{ label: 'Tambah Produk', href: '/partner/products/new' }}
        />
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

      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          className="mt-6"
        />
      )}
    </div>
  );
}
