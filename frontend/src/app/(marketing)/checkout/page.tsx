'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/shared/Container';
import { Price } from '@/components/shared/Price';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useHydrated } from '@/hooks/useHydrated';

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, isLoading, fetch } = useCartStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login?next=/checkout');
      return;
    }
    fetch();
  }, [hydrated, isAuthenticated, fetch, router]);

  useEffect(() => {
    if (hydrated && isAuthenticated && !isLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [hydrated, isAuthenticated, isLoading, items.length, router]);

  if (!hydrated || isLoading) {
    return (
      <main className="py-10 md:py-14">
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-64 rounded-card bg-gray-100" />
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <h1 className="mb-10 text-h1 font-bold text-greeva-black">Checkout</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <CheckoutForm />
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 rounded-card bg-greeva-sand-warm p-6">
              <h2 className="mb-5 text-h3 font-semibold text-greeva-black">Pesananmu</h2>

              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.variant_id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="flex-1 leading-snug">
                      <p className="font-medium text-greeva-black">{item.product_name}</p>
                      <p className="text-gray-500">
                        {item.variant_name} × {item.quantity}
                      </p>
                    </div>
                    <Price
                      cents={item.price * item.quantity}
                      className="flex-shrink-0 font-medium text-greeva-forest-dark"
                    />
                  </li>
                ))}
              </ul>

              <div className="my-5 border-t border-gray-200" />

              <div className="flex justify-between text-base font-bold">
                <span className="text-greeva-black">Subtotal</span>
                <Price cents={subtotal} className="text-greeva-forest-dark" />
              </div>
              <p className="mt-1 text-xs text-gray-500">+ ongkos kirim sesuai kurir yang dipilih di formulir</p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
