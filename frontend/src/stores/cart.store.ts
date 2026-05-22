'use client';

import { create } from 'zustand';
import * as cartApi from '@/lib/api/cart';
import { ensureGuestCartToken, getGuestCartToken, clearGuestCartToken } from '@/lib/guestCart';
import type { CartItem } from '@/types/cart';

function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number; // sen
  isLoading: boolean;

  fetch: () => Promise<void>;
  addItem: (variantId: number, qty: number) => Promise<void>;
  updateItem: (variantId: number, qty: number) => Promise<void>;
  removeItem: (variantId: number) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
  /** Dipanggil setelah user login — gabungkan guest cart ke akun jika ada token */
  mergeAfterLogin: () => Promise<void>;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  count: 0,
  subtotal: 0,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartApi.getCart();
      set({ items: cart.items, count: cart.count, subtotal: cart.subtotal });
    } catch {
      set({ items: [], count: 0, subtotal: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId, qty) => {
    // Pastikan guest token ada sebelum write (interceptor akan kirim header)
    if (typeof window !== 'undefined' && !localStorage.getItem('greeva_token')) {
      ensureGuestCartToken();
    }

    const item = await cartApi.addCartItem(variantId, qty);
    set((state) => {
      const existing = state.items.find((i) => i.variant_id === variantId);
      const items = existing
        ? state.items.map((i) =>
            i.variant_id === variantId ? { ...i, quantity: item.quantity } : i,
          )
        : [...state.items, item];
      return { items, count: items.length, subtotal: calcSubtotal(items) };
    });
  },

  updateItem: async (variantId, qty) => {
    if (qty === 0) {
      await get().removeItem(variantId);
      return;
    }
    const updated = await cartApi.updateCartItem(variantId, qty);
    if (updated) {
      set((state) => {
        const items = state.items.map((i) =>
          i.variant_id === variantId ? { ...i, quantity: updated.quantity } : i,
        );
        return { items, count: items.length, subtotal: calcSubtotal(items) };
      });
    }
  },

  removeItem: async (variantId) => {
    await cartApi.removeCartItem(variantId);
    set((state) => {
      const items = state.items.filter((i) => i.variant_id !== variantId);
      return { items, count: items.length, subtotal: calcSubtotal(items) };
    });
  },

  clear: async () => {
    await cartApi.clearCart();
    set({ items: [], count: 0, subtotal: 0 });
  },

  reset: () => set({ items: [], count: 0, subtotal: 0 }),

  mergeAfterLogin: async () => {
    const guestToken = getGuestCartToken();
    if (!guestToken) return;

    try {
      const cart = await cartApi.mergeGuestCart(guestToken);
      set({ items: cart.items, count: cart.count, subtotal: cart.subtotal });
    } catch {
      // Merge gagal — biarkan, fetch ulang dari auth cart
      await get().fetch();
    } finally {
      clearGuestCartToken();
    }
  },
}));
