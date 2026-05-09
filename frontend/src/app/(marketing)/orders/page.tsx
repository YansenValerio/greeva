'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { getOrders } from '@/lib/api/orders';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from '@/hooks/useHydrated';
import type { Order } from '@/types/order';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  paid: 'green',
  packing: 'green',
  shipped: 'green',
  delivered: 'green',
  completed: 'green',
  pending_payment: 'amber',
  payment_failed: 'gray',
  cancelled: 'gray',
  refunded: 'gray',
};

export default function OrdersPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login?next=/orders');
      return;
    }
    getOrders({ per_page: 20 })
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || loading) {
    return (
      <main className="py-10 md:py-14">
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-gray-200" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-card bg-gray-100" />
            ))}
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <h1 className="mb-8 text-h1 font-bold text-greeva-black">Pesanan Saya</h1>

        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-gray-500">Belum ada pesanan.</p>
            <Link href="/shop" className="mt-4 inline-block text-sm text-greeva-starbucks-green hover:underline">
              Mulai belanja →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.order_number}`}
                className="block rounded-card bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-greeva-black">{order.order_number}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE[order.status] ?? 'gray'}>{order.status_label}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <p className="text-gray-600">{order.items?.length ?? '—'} item</p>
                  <Price cents={order.grand_total} className="font-semibold text-greeva-forest-dark" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
