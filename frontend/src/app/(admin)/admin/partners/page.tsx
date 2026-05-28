'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton, ListSkeleton } from '@/components/shared/Skeleton';
import { adminGetPartners } from '@/lib/api/admin';
import type { Partner } from '@/types/partner';
import type { PaginationMeta } from '@/types/api';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminGetPartners({ per_page: 20, page })
      .then((res) => {
        setPartners(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

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
      <PageHeader title="Mitra" />

      {partners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada mitra"
          description="Daftar mitra konsinyasi akan muncul di sini."
        />
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {partners.map((p) => (
            <Link
              key={p.id}
              href={`/admin/partners/${p.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-greeva-mint-light/40"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-greeva-black">{p.name}</p>
                {p.user && (
                  <p className="text-xs text-gray-400">{p.user.email}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {p.revenue_share_percent !== undefined && (
                  <span className="text-sm text-gray-600">{p.revenue_share_percent}% bagi hasil</span>
                )}
                <Badge variant={p.is_active ? 'green' : 'gray'}>
                  {p.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
                <span className="text-gray-300">›</span>
              </div>
            </Link>
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
