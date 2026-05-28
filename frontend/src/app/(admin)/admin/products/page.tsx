'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { adminGetProducts, adminBulkUpdateProductStatus } from '@/lib/api/admin';
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

const STATUS_FILTERS = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu Review', value: 'pending_review' },
  { label: 'Aktif', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Nonaktif', value: 'inactive' },
];

const BULK_ACTIONS: { label: string; value: string }[] = [
  { label: 'Aktifkan', value: 'active' },
  { label: 'Nonaktifkan', value: 'inactive' },
  { label: 'Arsipkan', value: 'archived' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('active');
  const [applying, setApplying] = useState(false);

  function load() {
    setLoading(true);
    adminGetProducts({ per_page: 20, page, status: status || undefined })
      .then((res) => {
        setProducts(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setSelected(new Set());
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  function changeStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === products.length ? new Set() : new Set(products.map((p) => p.id)),
    );
  }

  async function applyBulk() {
    const ids = [...selected];
    if (ids.length === 0) return;

    const label = BULK_ACTIONS.find((a) => a.value === bulkStatus)?.label ?? bulkStatus;
    const ok = await confirm({
      title: `${label} ${ids.length} produk?`,
      message: 'Perubahan status akan diterapkan ke semua produk terpilih.',
      danger: bulkStatus === 'archived',
    });
    if (!ok) return;

    setApplying(true);
    try {
      const res = await adminBulkUpdateProductStatus({ product_ids: ids, status: bulkStatus });
      toast.success(`${res.updated} produk diperbarui.`);
      setSelected(new Set());
      load();
    } catch {
      toast.error('Gagal memperbarui produk.');
    } finally {
      setApplying(false);
    }
  }

  const allChecked = products.length > 0 && selected.size === products.length;

  return (
    <div>
      <PageHeader title="Produk" />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => changeStatus(f.value)}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              status === f.value
                ? 'bg-greeva-forest text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card bg-greeva-mint-light px-4 py-3">
          <span className="text-sm font-medium text-greeva-forest-dark">
            {selected.size} terpilih
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-lg border-[1.5px] border-greeva-forest/30 bg-white px-3 py-1.5 text-sm focus:border-greeva-forest focus:outline-none"
          >
            {BULK_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <button
            onClick={applyBulk}
            disabled={applying}
            className="rounded-pill bg-greeva-forest px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-greeva-starbucks-green disabled:opacity-50"
          >
            {applying ? 'Memproses…' : 'Terapkan'}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-greeva-forest-dark/70 hover:underline"
          >
            Batal
          </button>
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={5} height="h-14" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Tidak ada produk"
          description="Produk yang diajukan mitra atau ditambah admin akan muncul di sini."
        />
      ) : (
        <div className="rounded-card bg-white shadow-card">
          <label className="flex items-center gap-3 border-b border-gray-100 px-5 py-3 text-xs font-medium uppercase tracking-[0.08em] text-gray-400">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 text-greeva-forest focus:ring-greeva-leaf"
            />
            Pilih semua
          </label>
          <div className="divide-y divide-gray-100">
            {products.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4 rounded border-gray-300 text-greeva-forest focus:ring-greeva-leaf"
                />
                <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                  <p className="truncate font-medium text-greeva-black">{p.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {p.partner && <span>{p.partner.name}</span>}
                    <Price cents={p.price} className="text-greeva-forest-dark" />
                  </div>
                </div>
                <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                  <Badge variant={STATUS_BADGE[p.status] ?? 'gray'}>{p.status_label}</Badge>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Kelola
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
