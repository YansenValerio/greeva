'use client';

import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** Style tombol confirm sebagai destructive (merah) */
  danger?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions | null;
  resolver: ((ok: boolean) => void) | null;

  ask: (options: ConfirmOptions) => Promise<boolean>;
  resolve: (ok: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolver: null,

  ask: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolver: resolve });
    }),

  resolve: (ok) => {
    const { resolver } = get();
    resolver?.(ok);
    set({ open: false, options: null, resolver: null });
  },
}));
