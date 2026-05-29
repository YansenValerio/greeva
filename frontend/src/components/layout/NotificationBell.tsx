'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from '@/lib/api/notifications';
import { getUnreadCount } from '@/lib/api/notifications';
import { useHydrated } from '@/hooks/useHydrated';

export function NotificationBell() {
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuthStore();
  const { unreadCount, setUnreadCount, resetUnread } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll unread count when authenticated
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    getUnreadCount().then(setUnreadCount).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then(setUnreadCount).catch(() => {});
    }, 60_000);
    return () => clearInterval(interval);
  }, [hydrated, isAuthenticated, setUnreadCount]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleOpen() {
    if (!open) {
      setOpen(true);
      setLoading(true);
      try {
        const res = await getNotifications(1);
        setNotifications(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  }

  async function handleMarkRead(id: number) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    resetUnread();
  }

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        aria-label={`Notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ''}`}
        className="relative text-white/80 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-[300] w-80 rounded-xl bg-white shadow-lg ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-greeva-black">Notifikasi</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-greeva-starbucks-green hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-greeva-mint-light border-t-greeva-forest" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Belum ada notifikasi</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read_at && handleMarkRead(n.id)}
                  className={`w-full border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50 ${
                    !n.read_at ? 'bg-greeva-mint-light/30' : ''
                  }`}
                >
                  <p className={`text-sm ${!n.read_at ? 'font-semibold text-greeva-black' : 'text-gray-700'}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {new Date(n.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-2">
            <Link
              href="/account/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-greeva-starbucks-green hover:underline"
            >
              Lihat semua →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
