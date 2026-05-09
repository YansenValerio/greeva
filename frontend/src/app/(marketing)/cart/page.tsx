'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { Price } from '@/components/shared/Price';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useHydrated } from '@/hooks/useHydrated';

export default function CartPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, isLoading, fetch } = useCartStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login?next=/cart');
      return;
    }
    fetch();
  }, [hydrated, isAuthenticated, fetch, router]);

  if (!hydrated || isLoading) {
    return (
      <main className="py-10 md:py-14">
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-gray-200" />
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 py-5 border-b">
                <div className="h-20 w-20 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
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
          <div className="mx-auto max-w-sm text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-200" />
            <h1 className="text-xl font-bold text-greeva-black">Keranjang kosong</h1>
            <p className="mt-2 text-sm text-gray-500">
              Belum ada produk di keranjangmu. Yuk, mulai belanja!
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center justify-center rounded-pill bg-greeva-forest px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-greeva-starbucks-green"
            >
              Lihat Produk
            </Link>
          </div>
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
                href="/checkout"
                className="mt-6 block w-full rounded-pill bg-greeva-forest py-4 text-center text-base font-semibold text-white transition-all hover:bg-greeva-starbucks-green hover:scale-[1.01]"
              >
                Lanjut ke Checkout
              </Link>

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
