'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { getPartnerInventoryLogs, getPartnerProducts } from '@/lib/api/partner';
import type { InventoryLog, InventoryReason } from '@/types/partner';
import type { Product } from '@/types/product';
import type { PaginationMeta } from '@/types/api';

const REASON_BADGE: Record<InventoryReason, 'green' | 'amber' | 'gray'> = {
  sale: 'amber',
  release: 'green',
  adjustment: 'gray',
  initial: 'gray',
};

const REASON_FILTERS: { label: string; value: InventoryReason | '' }[] = [
  { label: 'Semua', value: '' },
  { label: 'Terjual', value: 'sale' },
  { label: 'Dikembalikan', value: 'release' },
  { label: 'Penyesuaian', value: 'adjustment' },
  { label: 'Stok Awal', value: 'initial' },
];

export default function PartnerInventoryPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | ''>('');
  const [reason, setReason] = useState<InventoryReason | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPartnerProducts({ per_page: 100 })
      .then((res) => setProducts(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getPartnerInventoryLogs({
      per_page: 20,
      page,
      product_id: productId || undefined,
      reason: reason || undefined,
    })
      .then((res) => {
        setLogs(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, reason, page]);

  function changeProduct(value: number | '') {
    setProductId(value);
    setPage(1);
  }

  function changeReason(value: InventoryReason | '') {
    setReason(value);
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Riwayat Stok"
        description="Setiap perubahan stok varian produk Anda — penjualan, pengembalian, dan penyesuaian manual."
      />

      {/* Product filter */}
      <div className="mb-4">
        <select
          value={productId}
          onChange={(e) => changeProduct(e.target.value ? Number(e.target.value) : '')}
          className="w-full rounded-lg border-[1.5px] border-gray-200 px-4 py-2.5 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40 sm:max-w-xs"
        >
          <option value="">Semua produk</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reason filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {REASON_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => changeReason(f.value)}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              reason === f.value
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-card bg-gray-100" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          Belum ada riwayat perubahan stok.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-greeva-black">
                  {log.product_name ?? `Produk #${log.product_id ?? '—'}`}
                </p>
                <p className="text-xs text-gray-400">
                  {log.variant_name}
                  {log.sku ? ` · ${log.sku}` : ''}
                  {log.order_number ? ` · ${log.order_number}` : ''}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {new Date(log.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`text-sm font-bold ${
                    log.change > 0 ? 'text-greeva-forest' : 'text-red-600'
                  }`}
                >
                  {log.change > 0 ? `+${log.change}` : log.change}
                </span>
                <span className="text-xs text-gray-400">
                  {log.stock_before} → {log.stock_after}
                </span>
                <Badge variant={REASON_BADGE[log.reason]}>{log.reason_label}</Badge>
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
