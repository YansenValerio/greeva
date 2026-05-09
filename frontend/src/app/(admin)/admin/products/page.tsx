'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { adminGetProducts } from '@/lib/api/admin';
import type { Product } from '@/types/product';

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminGetProducts({ per_page: 50, status: status || undefined })
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <PageHeader title="Produk" />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
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

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 rounded-card bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Tidak ada produk.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-greeva-black">{p.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  {p.partner && <span>{p.partner.name}</span>}
                  <Price cents={p.price} className="text-greeva-forest-dark" />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
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
      )}
    </div>
  );
}
