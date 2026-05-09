import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/shared/Container';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CategoryFilter } from '@/components/catalog/CategoryFilter';
import { getProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';

export const metadata: Metadata = {
  title: 'Toko',
  description: 'Belanja produk brand hijau lokal Indonesia terkurasi di Greeva.',
};

interface ShopPageProps {
  searchParams: {
    category?: string;
    page?: string;
    search?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [productsRes, categories] = await Promise.all([
    getProducts({
      category: searchParams.category,
      page: searchParams.page ? Number(searchParams.page) : 1,
      search: searchParams.search,
      per_page: 20,
    }).catch(() => ({ data: [], meta: null, links: null })),
    getCategories().catch(() => []),
  ]);

  return (
    <main>
      {/* Header */}
      <section className="bg-greeva-sand-warm py-10 md:py-12">
        <Container>
          <p className="text-caption uppercase tracking-[0.08em] text-greeva-starbucks-green">
            Koleksi Terkurasi
          </p>
          <h1 className="mt-2 text-h1 font-bold text-greeva-black">Toko</h1>
          <p className="mt-2 text-base text-gray-600">
            Produk brand hijau lokal pilihan — ramah lingkungan, berkualitas.
          </p>
        </Container>
      </section>

      {/* Catalog */}
      <section className="py-10 md:py-14">
        <Container>
          {/* Filter kategori */}
          {categories.length > 0 && (
            <div className="mb-8">
              <Suspense>
                <CategoryFilter categories={categories} />
              </Suspense>
            </div>
          )}

          {/* Grid produk */}
          <ProductGrid products={productsRes.data ?? []} />

          {/* Pagination placeholder */}
          {productsRes.meta && productsRes.meta.last_page > 1 && (
            <div className="mt-10 flex justify-center gap-2 text-sm text-gray-500">
              <span>
                Halaman {productsRes.meta.current_page} dari {productsRes.meta.last_page}
              </span>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
