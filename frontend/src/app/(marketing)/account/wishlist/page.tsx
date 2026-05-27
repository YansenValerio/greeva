'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { useAuthStore } from '@/stores/auth.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useHydrated } from '@/hooks/useHydrated';
import { getWishlist } from '@/lib/api/wishlist';
import type { Product } from '@/types/product';

export default function AccountWishlistPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const ids = useWishlistStore((s) => s.ids);
  const setIds = useWishlistStore((s) => s.setIds);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login?next=/account/wishlist');
      return;
    }
    getWishlist()
      .then((data) => {
        setProducts(data);
        setIds(data.map((p) => p.id));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated, router, setIds]);

  // Sembunyikan item yang baru dihapus dari wishlist (heart dimatikan)
  const visible = products.filter((p) => ids.includes(p.id));

  if (!hydrated || loading) {
    return (
      <main className="py-10 md:py-14">
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-card bg-gray-100" />
              ))}
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm text-greeva-starbucks-green hover:underline"
          >
            ← Akun Saya
          </Link>
          <h1 className="mt-2 text-h1 font-bold text-greeva-black">Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            Produk yang kamu simpan untuk dibeli nanti.
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="py-16 text-center">
            <Heart className="mx-auto mb-4 h-14 w-14 text-gray-200" />
            <p className="font-medium text-greeva-black">Wishlist kosong</p>
            <p className="mt-1 text-sm text-gray-500">
              Tekan ikon hati pada produk untuk menyimpannya di sini.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-pill bg-greeva-forest px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-greeva-starbucks-green"
            >
              Lihat Produk
            </Link>
          </div>
        ) : (
          <ProductGrid products={visible} />
        )}
      </Container>
    </main>
  );
}
