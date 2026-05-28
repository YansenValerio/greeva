'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { Price } from '@/components/shared/Price';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useHydrated } from '@/hooks/useHydrated';

export default function CartPage() {
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, isLoading, fetch } = useCartStore();

  useEffect(() => {
    if (!hydrated) return;
    fetch();
  }, [hydrated, fetch]);

  if (!hydrated || isLoading) {
    return (
      <main className="py-10 md:py-14">
        <Container>
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 border-b py-5">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center">
        <Container>
          <EmptyState
            icon={ShoppingBag}
            size="lg"
            title="Keranjang kosong"
            description="Belum ada produk di keranjangmu. Yuk, mulai belanja!"
            action={{ label: 'Lihat Produk', href: '/shop' }}
          />
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <h1 className="mb-8 text-h1 font-bold text-greeva-black">Keranjang Belanja</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Item list */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <CartItemRow key={item.variant_id} item={item} />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-card bg-greeva-sand-warm p-6">
              <h2 className="mb-5 text-h3 font-semibold text-greeva-black">Ringkasan Pesanan</h2>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-greeva-text-body">
                    <Price cents={subtotal} />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Ongkos kirim</dt>
                  <dd className="text-gray-500">Dihitung saat checkout</dd>
                </div>
              </dl>

              <div className="my-5 border-t border-gray-200" />

              <div className="flex justify-between text-base font-bold">
                <span className="text-greeva-black">Total Sementara</span>
                <Price cents={subtotal} className="text-greeva-forest-dark" />
              </div>

              <Link
                href={isAuthenticated ? '/checkout' : '/login?next=/checkout'}
                className="mt-6 block w-full rounded-pill bg-greeva-forest py-4 text-center text-base font-semibold text-white transition-all hover:bg-greeva-starbucks-green hover:scale-[1.01]"
              >
                {isAuthenticated ? 'Lanjut ke Checkout' : 'Masuk untuk Checkout'}
              </Link>

              {!isAuthenticated && (
                <p className="mt-2 text-center text-xs text-gray-500">
                  Login diperlukan untuk menyelesaikan pesanan
                </p>
              )}

              <Link
                href="/shop"
                className="mt-3 block text-center text-sm text-greeva-starbucks-green hover:underline"
              >
                ← Lanjut belanja
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
