import { client } from './client';
import type { Order, CheckoutPayload, CheckoutResult } from '@/types/order';
import type { ApiCollection, ApiItem } from '@/types/api';
import type { VoucherPreviewResult } from '@/types/voucher';

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const { data } = await client.post<CheckoutResult>('/checkout', payload);
  return data;
}

export async function previewVoucher(code: string): Promise<VoucherPreviewResult> {
  const { data } = await client.post<ApiItem<VoucherPreviewResult>>('/vouchers/preview', { code });
  return data.data;
}

export async function getOrders(params?: {
  status?: string;
  per_page?: number;
  page?: number;
}): Promise<ApiCollection<Order>> {
  const { data } = await client.get<ApiCollection<Order>>('/orders', { params });
  return data;
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const { data } = await client.get<ApiItem<Order>>(`/orders/${orderNumber}`);
  return data.data;
}

export async function mockPay(orderNumber: string): Promise<void> {
  await client.post(`/dev/mock-pay/${orderNumber}`);
}

export async function cancelOrder(orderNumber: string, reason?: string): Promise<Order> {
  const { data } = await client.post<ApiItem<Order>>(`/orders/${orderNumber}/cancel`, {
    reason: reason ?? null,
  });
  return data.data;
}
