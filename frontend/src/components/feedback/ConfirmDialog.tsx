'use client';

import { useEffect, useRef } from 'react';
import { useConfirmStore } from '@/stores/confirm.store';

export function ConfirmDialog() {
  const { open, options, resolve } = useConfirmStore();
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus tombol confirm saat dialog open + handle Escape
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resolve(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, resolve]);

  if (!open || !options) return null;

  const {
    title,
    message,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    danger = false,
  } = options;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup dialog"
        onClick={() => resolve(false)}
        className="absolute inset-0 bg-black/50"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-card bg-white p-6 shadow-card-hover">
        <h2 id="confirm-title" className="text-lg font-semibold text-greeva-black">
          {title}
        </h2>
        {message && (
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => resolve(false)}
            className="flex-1 rounded-pill border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => resolve(true)}
            className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-greeva-forest hover:bg-greeva-starbucks-green'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
