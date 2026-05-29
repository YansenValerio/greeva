'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/shared/Badge';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { adminGetUsers, adminToggleSuspendUser, type AdminUser } from '@/lib/api/admin';
import { toast } from '@/lib/feedback';
import { confirm } from '@/lib/feedback';
import type { PaginationMeta } from '@/types/api';

const ROLE_FILTERS = [
  { label: 'Semua', value: '' },
  { label: 'Buyer', value: 'buyer' },
  { label: 'Partner', value: 'partner' },
  { label: 'Admin', value: 'admin' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminGetUsers({ page, per_page: 20, role: role || undefined, search: search || undefined })
      .then((res) => {
        setUsers(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, role, search]);

  function changeRole(v: string) {
    setRole(v);
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  async function handleSuspend(user: AdminUser) {
    const action = user.is_suspended ? 'aktifkan kembali' : 'suspend';
    const ok = await confirm({
      title: `${user.is_suspended ? 'Aktifkan' : 'Suspend'} akun?`,
      message: `Yakin ingin ${action} akun ${user.name}?`,
      danger: !user.is_suspended,
      confirmText: user.is_suspended ? 'Aktifkan' : 'Suspend',
    });
    if (!ok) return;
    try {
      const updated = await adminToggleSuspendUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      toast.success(`Akun berhasil di-${action}.`);
    } catch {
      toast.error('Gagal mengubah status akun.');
    }
  }

  return (
    <div>
      <PageHeader title="Pengguna" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => changeRole(f.value)}
              className={`rounded-pill px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                role === f.value
                  ? 'bg-greeva-forest text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama atau email..."
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-pill bg-greeva-forest px-4 py-2 text-sm font-medium text-white hover:bg-greeva-starbucks-green"
          >
            Cari
          </button>
        </form>
      </div>

      {loading ? (
        <ListSkeleton rows={5} height="h-14" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="Tidak ada pengguna" description="Coba ubah filter pencarian." />
      ) : (
        <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-greeva-black truncate">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge variant={user.role === 'admin' ? 'green' : user.role === 'partner' ? 'amber' : 'gray'}>
                  {user.role_label}
                </Badge>
                {user.is_suspended && (
                  <Badge variant="gray">Disuspend</Badge>
                )}
                <p className="text-[11px] text-gray-400">
                  {new Date(user.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              {user.role !== 'admin' && (
                <button
                  onClick={() => handleSuspend(user)}
                  className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-colors ${
                    user.is_suspended
                      ? 'bg-greeva-forest text-white hover:bg-greeva-starbucks-green'
                      : 'border border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {user.is_suspended ? 'Aktifkan' : 'Suspend'}
                </button>
              )}
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
