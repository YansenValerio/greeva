'use client';

import { create } from 'zustand';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '@/lib/api/wishlist';

interface WishlistState {
  ids: number[];
  loaded: boolean;
  has: (productId: number) => boolean;
  setIds: (ids: number[]) => void;
  fetch: () => Promise<void>;
  toggle: (productId: number) => Promise<boolean>;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  loaded: false,

  has: (productId) => get().ids.includes(productId),

  setIds: (ids) => set({ ids, loaded: true }),

  fetch: async () => {
    try {
      const products = await getWishlist();
      set({ ids: products.map((p) => p.id), loaded: true });
    } catch {
      set({ ids: [], loaded: true });
    }
  },

  // Optimistic toggle. Mengembalikan status akhir (true = tersimpan di wishlist).
  toggle: async (productId) => {
    const wasInList = get().ids.includes(productId);
    const willBeInList = !wasInList;

    set((state) => ({
      ids: willBeInList
        ? [...state.ids, productId]
        : state.ids.filter((id) => id !== productId),
    }));

    try {
      if (willBeInList) {
        await addToWishlist(productId);
      } else {
        await removeFromWishlist(productId);
      }
      return willBeInList;
    } catch (err) {
      // Revert kalau gagal
      set((state) => ({
        ids: wasInList
          ? [...state.ids, productId]
          : state.ids.filter((id) => id !== productId),
      }));
      throw err;
    }
  },

  reset: () => set({ ids: [], loaded: false }),
}));
