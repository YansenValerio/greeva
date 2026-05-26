import { client } from './client';
import type { ApiCollection, ApiItem } from '@/types/api';
import type {
  Partner,
  PartnerEarning,
  EarningSummary,
  PayoutBatch,
  PartnerAnalytics,
  InventoryLog,
  InventoryReason,
} from '@/types/partner';
import type { Product } from '@/types/product';

export interface PartnerProductParams {
  page?: number;
  per_page?: number;
  status?: string;
}

export interface PartnerEarningParams {
  page?: number;
  per_page?: number;
  status?: 'pending' | 'available' | 'paid' | 'reversed';
}

export interface StoreProductPayload {
  name: string;
  description?: string;
  short_description?: string;
  price: number; // sen
  compare_price?: number | null; // sen
  category_id: number;
  weight: number; // gram
  material?: string;
  sustainability_notes?: string;
  meta_title?: string;
  meta_description?: string;
  images?: string[];
}

export interface UpdateProfilePayload {
  name?: string;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
}

// Profile
export async function getPartnerProfile(): Promise<Partner> {
  const { data } = await client.get<ApiItem<Partner>>('/partner/profile');
  return data.data;
}

export async function updatePartnerProfile(payload: UpdateProfilePayload): Promise<Partner> {
  const { data } = await client.put<ApiItem<Partner>>('/partner/profile', payload);
  return data.data;
}

// Products
export async function getPartnerProducts(
  params?: PartnerProductParams,
): Promise<ApiCollection<Product>> {
  const { data } = await client.get<ApiCollection<Product>>('/partner/products', { params });
  return data;
}

export async function getPartnerProduct(id: number): Promise<Product> {
  const { data } = await client.get<ApiItem<Product>>(`/partner/products/${id}`);
  return data.data;
}

export async function createPartnerProduct(payload: StoreProductPayload): Promise<Product> {
  const { data } = await client.post<ApiItem<Product>>('/partner/products', payload);
  return data.data;
}

export async function updatePartnerProduct(
  id: number,
  payload: Partial<StoreProductPayload>,
): Promise<Product> {
  const { data } = await client.put<ApiItem<Product>>(`/partner/products/${id}`, payload);
  return data.data;
}

export async function deletePartnerProduct(id: number): Promise<void> {
  await client.delete(`/partner/products/${id}`);
}

export async function submitPartnerProduct(id: number): Promise<Product> {
  const { data } = await client.post<ApiItem<Product>>(`/partner/products/${id}/submit`);
  return data.data;
}

// Earnings
export async function getPartnerEarnings(
  params?: PartnerEarningParams,
): Promise<ApiCollection<PartnerEarning>> {
  const { data } = await client.get<ApiCollection<PartnerEarning>>('/partner/earnings', { params });
  return data;
}

export async function getPartnerEarningSummary(): Promise<EarningSummary> {
  const { data } = await client.get<{ data: EarningSummary }>('/partner/earnings/summary');
  return data.data;
}

// Payouts
export async function getPartnerPayouts(params?: {
  page?: number;
  per_page?: number;
}): Promise<ApiCollection<PayoutBatch>> {
  const { data } = await client.get<ApiCollection<PayoutBatch>>('/partner/payouts', { params });
  return data;
}

export async function getPartnerPayout(id: number): Promise<PayoutBatch> {
  const { data } = await client.get<ApiItem<PayoutBatch>>(`/partner/payouts/${id}`);
  return data.data;
}

// Analytics
export async function getPartnerAnalytics(): Promise<PartnerAnalytics> {
  const { data } = await client.get<ApiItem<PartnerAnalytics>>('/partner/analytics');
  return data.data;
}

// Inventory history
export interface InventoryLogParams {
  page?: number;
  per_page?: number;
  product_id?: number;
  variant_id?: number;
  reason?: InventoryReason;
}

export async function getPartnerInventoryLogs(
  params?: InventoryLogParams,
): Promise<ApiCollection<InventoryLog>> {
  const { data } = await client.get<ApiCollection<InventoryLog>>('/partner/inventory-logs', {
    params,
  });
  return data;
}

// Variants
export interface StoreVariantPayload {
  sku: string;
  name: string;
  price?: number | null; // sen; null = pakai harga produk
  stock: number;
  is_active?: boolean;
}

export async function createPartnerVariant(
  productId: number,
  payload: StoreVariantPayload,
): Promise<import('@/types/product').ProductVariant> {
  const { data } = await client.post<ApiItem<import('@/types/product').ProductVariant>>(
    `/partner/products/${productId}/variants`,
    payload,
  );
  return data.data;
}

export async function updatePartnerVariant(
  productId: number,
  variantId: number,
  payload: Partial<StoreVariantPayload>,
): Promise<import('@/types/product').ProductVariant> {
  const { data } = await client.put<ApiItem<import('@/types/product').ProductVariant>>(
    `/partner/products/${productId}/variants/${variantId}`,
    payload,
  );
  return data.data;
}

export async function deletePartnerVariant(productId: number, variantId: number): Promise<void> {
  await client.delete(`/partner/products/${productId}/variants/${variantId}`);
}
