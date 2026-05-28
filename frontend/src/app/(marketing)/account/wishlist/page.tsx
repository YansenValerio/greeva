'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton, ProductGridSkeleton } from '@/components/shared/Skeleton';
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
          <Skeleton className="mb-6 h-8 w-48" />
          <ProductGridSkeleton count={4} />
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
          <EmptyState
            icon={Heart}
            title="Wishlist kosong"
            description="Tekan ikon hati pada produk untuk menyimpannya di sini."
            action={{ label: 'Lihat Produk', href: '/shop' }}
          />
        ) : (
          <ProductGrid products={visible} />
        )}
      </Container>
    </main>
  );
}
