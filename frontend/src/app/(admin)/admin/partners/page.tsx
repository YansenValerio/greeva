'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { adminGetPartners } from '@/lib/api/admin';
import type { Partner } from '@/types/partner';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetPartners({ per_page: 50 })
      .then((res) => setPartners(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      <PageHeader title="Mitra" />

      {partners.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Belum ada mitra terdaftar.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
