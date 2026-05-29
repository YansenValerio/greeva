'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { Pagination } from '@/components/shared/Pagination';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from '@/lib/api/notifications';
import { useNotificationStore } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from '@/hooks/useHydrated';
import type { PaginationMeta } from '@/types/api';

export default function NotificationsPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setUnreadCount, resetUnread } = useNotificationStore();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getNotifications(page)
      .then((res) => {
        setNotifications(res.data);
        setMeta(res.meta);
        setUnreadCount(res.unread_count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, setUnreadCount]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login?next=/account/notifications');
      return;
    }
    load();
  }, [hydrated, isAuthenticated, router, load]);

  async function handleRead(n: AppNotification) {
    if (n.read_at) return;
    await markNotificationRead(n.id);
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)),
    );
    setUnreadCount(useNotificationStore.getState().unreadCount - 1);
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((x) => ({ ...x, read_at: new Date().toISOString() })));
    resetUnread();
  }

  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <main className="py-10 md:py-14">
      <Container>
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/account" className="hover:text-greeva-starbucks-green transition-colors">
            Akun Saya
          </Link>
          <span>/</span>
          <span className="text-greeva-black">Notifikasi</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-h1 font-bold text-greeva-black">Notifikasi</h1>
          {hasUnread && (
            <button
              onClick={handleReadAll}
              className="inline-flex items-center gap-1.5 rounded-pill border border-greeva-forest px-4 py-1.5 text-sm font-medium text-greeva-forest hover:bg-greeva-mint-light transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Tandai semua dibaca
            </button>
          )}
        </div>

        {loading ? (
          <ListSkeleton rows={6} height="h-20" />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Belum ada notifikasi"
            description="Notifikasi seputar pesanan dan akunmu akan muncul di sini."
          />
        ) : (
          <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleRead(n)}
                className={`flex w-full gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${
                  !n.read_at ? 'bg-greeva-mint-light/30' : ''
                }`}
              >
                <div
                  className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                    !n.read_at ? 'bg-greeva-forest' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !n.read_at ? 'font-semibold text-greeva-black' : 'text-gray-700'
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </button>
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
      </Container>
    </main>
  );
}
