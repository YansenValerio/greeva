import { client } from './client';
import type { CartData, CartItem } from '@/types/cart';

export async function getCart(): Promise<CartData> {
  const { data } = await client.get<{ data: CartData }>('/cart');
  return data.data;
}

export async function addCartItem(variantId: number, quantity: number): Promise<CartItem> {
  const { data } = await client.post<{ data: CartItem }>('/cart/items', {
    variant_id: variantId,
    quantity,
  });
  return data.data;
}

export async function updateCartItem(
  variantId: number,
  quantity: number,
): Promise<CartItem | null> {
  const { data } = await client.put<{ data?: CartItem }>(`/cart/items/${variantId}`, {
    quantity,
  });
  return data.data ?? null;
}

export async function removeCartItem(variantId: number): Promise<void> {
  await client.delete(`/cart/items/${variantId}`);
}

export async function clearCart(): Promise<void> {
  await client.delete('/cart');
}

export async function mergeGuestCart(guestToken: string): Promise<CartData> {
  const { data } = await client.post<{ data: CartData }>('/cart/merge', {
    guest_token: guestToken,
  });
  return data.data;
}
