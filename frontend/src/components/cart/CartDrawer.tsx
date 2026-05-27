'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';
import { Price } from '@/components/shared/Price';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { useCartStore } from '@/stores/cart.store';
import { useCartUiStore } from '@/stores/cart-ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from '@/hooks/useHydrated';

export function CartDrawer() {
  const hydrated = useHydrated();
  const open = useCartUiStore((s) => s.open);
  const closeCart = useCartUiStore((s) => s.closeCart);
  const { items, subtotal, count } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Escape untuk tutup + kunci scroll body saat drawer terbuka
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-[150] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-card-hover transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-greeva-black">
            Keranjang
            {hydrated && count > 0 && (
              <span className="text-sm font-normal text-gray-400">({count})</span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Tutup keranjang"
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="mb-4 h-14 w-14 text-gray-200" />
            <p className="font-medium text-greeva-black">Keranjang kosong</p>
            <p className="mt-1 text-sm text-gray-500">
              Yuk, mulai belanja produk hijau lokal.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-5 inline-flex rounded-pill bg-greeva-forest px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-greeva-starbucks-green"
            >
              Lihat Produk
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <CartItemRow key={item.variant_id} item={item} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <Price cents={subtotal} className="text-base font-bold text-greeva-forest-dark" />
              </div>
              <p className="mb-4 text-xs text-gray-400">Ongkos kirim dihitung saat checkout.</p>
              <Link
                href={isAuthenticated ? '/checkout' : '/login?next=/checkout'}
                onClick={closeCart}
                className="block w-full rounded-pill bg-greeva-forest py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-greeva-starbucks-green hover:scale-[1.01]"
              >
                {isAuthenticated ? 'Checkout' : 'Masuk untuk Checkout'}
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 block text-center text-sm text-greeva-starbucks-green hover:underline"
              >
                Lihat keranjang lengkap
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
