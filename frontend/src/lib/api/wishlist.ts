import { client } from './client';
import type { Product } from '@/types/product';

export async function getWishlist(): Promise<Product[]> {
  const { data } = await client.get<{ data: Product[] }>('/wishlist');
  return data.data;
}

export async function addToWishlist(productId: number): Promise<void> {
  await client.post(`/wishlist/${productId}`);
}

export async function removeFromWishlist(productId: number): Promise<void> {
  await client.delete(`/wishlist/${productId}`);
}
