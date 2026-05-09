import { client } from './client';
import type { Order, CheckoutPayload, CheckoutResult } from '@/types/order';
import type { ApiCollection, ApiItem } from '@/types/api';

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const { data } = await client.post<CheckoutResult>('/checkout', payload);
  return data;
}

export async function getOrders(params?: {
  status?: string;
  per_page?: number;
}): Promise<ApiCollection<Order>> {
  const { data } = await client.get<ApiCollection<Order>>('/orders', { params });
  return data;
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const { data } = await client.get<ApiItem<Order>>(`/orders/${orderNumber}`);
  return data.data;
}
