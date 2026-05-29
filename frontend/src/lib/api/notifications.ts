import { client } from './client';
import type { PaginationMeta } from '@/types/api';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  meta: PaginationMeta;
  unread_count: number;
}

export async function getNotifications(page = 1): Promise<NotificationListResponse> {
  const { data } = await client.get<NotificationListResponse>('/notifications', {
    params: { page, per_page: 20 },
  });
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await client.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markNotificationRead(id: number): Promise<void> {
  await client.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await client.patch('/notifications/read-all');
}
