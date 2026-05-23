'use client';

import { useToastStore, type ToastType } from '@/stores/toast.store';
import { useConfirmStore, type ConfirmOptions } from '@/stores/confirm.store';

interface ToastOptions {
  duration?: number;
}

function show(type: ToastType, message: string, opts?: ToastOptions): string {
  return useToastStore.getState().push({
    type,
    message,
    duration: opts?.duration ?? (type === 'error' ? 6000 : 4000),
  });
}

/**
 * Toast notification API. Bisa dipanggil dari mana saja (client component / handler).
 * Contoh: toast.success('Profil disimpan.');
 */
export const toast = {
  success: (message: string, opts?: ToastOptions) => show('success', message, opts),
  error:   (message: string, opts?: ToastOptions) => show('error', message, opts),
  info:    (message: string, opts?: ToastOptions) => show('info', message, opts),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};

/**
 * Confirmation dialog. Returns Promise<boolean> — true jika user klik confirm.
 * Pengganti window.confirm() yang konsisten dengan brand.
 *
 * Contoh:
 *   const ok = await confirm({
 *     title: 'Hapus alamat?',
 *     message: 'Tindakan ini tidak bisa dibatalkan.',
 *     danger: true,
 *   });
 *   if (ok) await deleteAddress(id);
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().ask(options);
}
