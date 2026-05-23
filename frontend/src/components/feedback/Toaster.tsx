'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore, type ToastItem } from '@/stores/toast.store';

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

const STYLES: Record<
  ToastItem['type'],
  { bg: string; border: string; icon: typeof CheckCircle2; iconColor: string }
> = {
  success: {
    bg: 'bg-white',
    border: 'border-greeva-forest/30',
    icon: CheckCircle2,
    iconColor: 'text-greeva-forest',
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-300',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  info: {
    bg: 'bg-white',
    border: 'border-greeva-ocean-blue/30',
    icon: Info,
    iconColor: 'text-greeva-ocean-blue',
  },
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const style = STYLES[toast.type];
  const Icon = style.icon;

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border ${style.border} ${style.bg} px-4 py-3 shadow-card-hover`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${style.iconColor}`} strokeWidth={2.5} />
      <p className="flex-1 text-sm text-greeva-black">{toast.message}</p>
      <button
        onClick={() => dismiss(toast.id)}
        aria-label="Tutup"
        className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
