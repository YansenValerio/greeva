import { client } from './client';
import type { ApiCollection, ApiItem } from '@/types/api';
import type { Product } from '@/types/product';

export interface ProductListParams {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  featured?: boolean;
}

export async function getProducts(
  params?: ProductListParams,
): Promise<ApiCollection<Product>> {
  const { data } = await client.get<ApiCollection<Product>>('/products', { params });
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await client.get<ApiItem<Product>>(`/products/${slug}`);
  return data.data;
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const { data } = await client.get<{ data: Product[] }>(`/products/${slug}/related`);
  return data.data;
}
