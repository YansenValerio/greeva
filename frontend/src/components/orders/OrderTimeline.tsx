import { Check, Package, Truck, Home, Sparkles, X } from 'lucide-react';
import type { Order } from '@/types/order';

interface OrderTimelineProps {
  order: Order;
}

interface Step {
  key: string;
  label: string;
  description: string;
  icon: typeof Check;
  date: string | null;
}

const ID_DATE = (iso: string): string =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Mapping status order ke index step pada happy path */
const HAPPY_PATH_INDEX: Record<string, number> = {
  pending_payment: 0,
  paid: 1,
  packing: 2,
  shipped: 3,
  delivered: 4,
  completed: 5,
};

const TERMINAL_BAD: Record<string, { label: string; description: string }> = {
  cancelled: {
    label: 'Pesanan Dibatalkan',
    description: 'Stok dikembalikan, dana akan di-refund jika sudah dibayar.',
  },
  payment_failed: {
    label: 'Pembayaran Gagal',
    description: 'Batas waktu pembayaran terlewati atau gateway menolak transaksi.',
  },
  refunded: {
    label: 'Dana Dikembalikan',
    description: 'Pesanan di-refund. Cek rekening kamu dalam 3–7 hari kerja.',
  },
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Status terminal "bad" — tampilkan card khusus, bukan stepper
  if (TERMINAL_BAD[order.status]) {
    const info = TERMINAL_BAD[order.status];
    return (
      <div className="rounded-card border border-red-100 bg-red-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <X className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-red-900">{info.label}</p>
            <p className="mt-0.5 text-sm text-red-700">{info.description}</p>
          </div>
        </div>
      </div>
    );
  }

  const steps: Step[] = [
    {
      key: 'pending_payment',
      label: 'Menunggu Pembayaran',
      description: 'Selesaikan pembayaran sebelum batas waktu.',
      icon: Sparkles,
      date: order.created_at,
    },
    {
      key: 'paid',
      label: 'Pembayaran Diterima',
      description: 'Kami sedang menyiapkan pesananmu.',
      icon: Check,
      date: order.paid_at,
    },
    {
      key: 'packing',
      label: 'Sedang Dikemas',
      description: 'Mitra menyiapkan produk untuk dikirim.',
      icon: Package,
      date: null,
    },
    {
      key: 'shipped',
      label: 'Dalam Pengiriman',
      description: 'Pesanan sudah dikirim oleh kurir.',
      icon: Truck,
      date: order.shipments?.find((s) => s.shipped_at)?.shipped_at ?? null,
    },
    {
      key: 'delivered',
      label: 'Diterima',
      description: 'Paket sudah sampai. 7 hari lagi otomatis selesai.',
      icon: Home,
      date: order.delivered_at,
    },
    {
      key: 'completed',
      label: 'Pesanan Selesai',
      description: 'Terima kasih sudah berbelanja di Greeva!',
      icon: Sparkles,
      date: order.completed_at,
    },
  ];

  const currentIndex = HAPPY_PATH_INDEX[order.status] ?? -1;

  return (
    <ol className="space-y-0">
      {steps.map((step, idx) => {
        const isComplete = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isPending = idx > currentIndex;
        const isLast = idx === steps.length - 1;
        const Icon = step.icon;

        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[19px] top-10 h-[calc(100%-2rem)] w-0.5 ${
                  isComplete ? 'bg-greeva-forest' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Icon circle */}
            <div
              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                isComplete
                  ? 'bg-greeva-forest text-white'
                  : isCurrent
                    ? 'bg-greeva-mint-light text-greeva-forest-dark ring-4 ring-greeva-leaf/30'
                    : 'bg-gray-100 text-gray-300'
              }`}
            >
              {isComplete ? (
                <Check className="h-5 w-5" strokeWidth={3} />
              ) : (
                <Icon className="h-4 w-4" strokeWidth={2.5} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1.5">
              <p
                className={`text-sm font-semibold ${
                  isPending ? 'text-gray-400' : 'text-greeva-black'
                }`}
              >
                {step.label}
                {isCurrent && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-greeva-leaf/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-greeva-forest-dark">
                    Sekarang
                  </span>
                )}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  isPending ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {step.description}
              </p>
              {step.date && !isPending && (
                <p className="mt-1 text-xs text-gray-400">{ID_DATE(step.date)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
