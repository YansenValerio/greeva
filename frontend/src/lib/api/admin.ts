import { client } from './client';
import type { ApiCollection, ApiItem } from '@/types/api';
import type { Partner, PartnerEarning, PayoutBatch } from '@/types/partner';
import type { Product } from '@/types/product';
import type { Order } from '@/types/order';
import type { Category } from '@/types/category';

export interface AdminProductParams {
  page?: number;
  per_page?: number;
  status?: string;
  partner_id?: number;
}

export interface AdminOrderParams {
  page?: number;
  per_page?: number;
  status?: string;
}

export interface AdminPayoutParams {
  page?: number;
  per_page?: number;
  status?: string;
  partner_id?: number;
}

export interface AdminUpdateProductStatusPayload {
  status: string;
  note?: string;
}

export interface AdminUpdateOrderStatusPayload {
  status: string;
  tracking_number?: string;
  courier?: string;
  courier_service?: string;
  note?: string;
}

export interface AdminStorePartnerPayload {
  user_id: number;
  name: string;
  revenue_share_percent?: number;
}

export interface AdminUpdatePartnerPayload {
  name?: string;
  revenue_share_percent?: number;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  is_active?: boolean;
}

export interface AdminGeneratePayoutPayload {
  partner_id: number;
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
}

export interface AdminMarkPaidPayload {
  payment_proof?: string;
  notes?: string;
}

// Categories
export interface AdminCategoryPayload {
  parent_id?: number | null;
  name: string;
  description?: string | null;
  image?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export async function adminGetCategories(): Promise<Category[]> {
  const { data } = await client.get<{ data: Category[] }>('/admin/categories');
  return data.data;
}

export async function adminCreateCategory(payload: AdminCategoryPayload): Promise<Category> {
  const { data } = await client.post<ApiItem<Category>>('/admin/categories', payload);
  return data.data;
}

export async function adminUpdateCategory(
  id: number,
  payload: Partial<AdminCategoryPayload>,
): Promise<Category> {
  const { data } = await client.put<ApiItem<Category>>(`/admin/categories/${id}`, payload);
  return data.data;
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await client.delete(`/admin/categories/${id}`);
}

// Partners
export async function adminGetPartners(params?: {
  page?: number;
  per_page?: number;
}): Promise<ApiCollection<Partner>> {
  const { data } = await client.get<ApiCollection<Partner>>('/admin/partners', { params });
  return data;
}

export async function adminGetPartner(id: number): Promise<Partner> {
  const { data } = await client.get<ApiItem<Partner>>(`/admin/partners/${id}`);
  return data.data;
}

export async function adminCreatePartner(payload: AdminStorePartnerPayload): Promise<Partner> {
  const { data } = await client.post<ApiItem<Partner>>('/admin/partners', payload);
  return data.data;
}

export async function adminUpdatePartner(
  id: number,
  payload: AdminUpdatePartnerPayload,
): Promise<Partner> {
  const { data } = await client.put<ApiItem<Partner>>(`/admin/partners/${id}`, payload);
  return data.data;
}

// Products
export async function adminGetProducts(
  params?: AdminProductParams,
): Promise<ApiCollection<Product>> {
  const { data } = await client.get<ApiCollection<Product>>('/admin/products', { params });
  return data;
}

export async function adminGetProduct(id: number): Promise<Product> {
  const { data } = await client.get<ApiItem<Product>>(`/admin/products/${id}`);
  return data.data;
}

export async function adminUpdateProductStatus(
  id: number,
  payload: AdminUpdateProductStatusPayload,
): Promise<Product> {
  const { data } = await client.patch<ApiItem<Product>>(`/admin/products/${id}/status`, payload);
  return data.data;
}

// Orders
export async function adminGetOrders(params?: AdminOrderParams): Promise<ApiCollection<Order>> {
  const { data } = await client.get<ApiCollection<Order>>('/admin/orders', { params });
  return data;
}

export async function adminGetOrder(id: number): Promise<Order> {
  const { data } = await client.get<ApiItem<Order>>(`/admin/orders/${id}`);
  return data.data;
}

export async function adminUpdateOrderStatus(
  id: number,
  payload: AdminUpdateOrderStatusPayload,
): Promise<Order> {
  const { data } = await client.patch<ApiItem<Order>>(`/admin/orders/${id}/status`, payload);
  return data.data;
}

// Earnings (per partner)
export async function adminGetPartnerEarnings(
  partnerId: number,
  params?: { page?: number; per_page?: number; status?: string },
): Promise<ApiCollection<PartnerEarning>> {
  const { data } = await client.get<ApiCollection<PartnerEarning>>(
    `/admin/partners/${partnerId}/earnings`,
    { params },
  );
  return data;
}

// Payouts
export async function adminGetPayouts(
  params?: AdminPayoutParams,
): Promise<ApiCollection<PayoutBatch>> {
  const { data } = await client.get<ApiCollection<PayoutBatch>>('/admin/payouts', { params });
  return data;
}

export async function adminGetPayout(id: number): Promise<PayoutBatch> {
  const { data } = await client.get<ApiItem<PayoutBatch>>(`/admin/payouts/${id}`);
  return data.data;
}

export async function adminGeneratePayout(
  payload: AdminGeneratePayoutPayload,
): Promise<PayoutBatch> {
  const { data } = await client.post<ApiItem<PayoutBatch>>('/admin/payouts', payload);
  return data.data;
}

export async function adminMarkPayoutProcessing(id: number): Promise<PayoutBatch> {
  const { data } = await client.patch<ApiItem<PayoutBatch>>(`/admin/payouts/${id}/process`);
  return data.data;
}

export async function adminMarkPayoutPaid(
  id: number,
  payload: AdminMarkPaidPayload,
): Promise<PayoutBatch> {
  const { data } = await client.patch<ApiItem<PayoutBatch>>(
    `/admin/payouts/${id}/mark-paid`,
    payload,
  );
  return data.data;
}

export async function adminCancelPayout(id: number): Promise<PayoutBatch> {
  const { data } = await client.patch<ApiItem<PayoutBatch>>(`/admin/payouts/${id}/cancel`);
  return data.data;
}
