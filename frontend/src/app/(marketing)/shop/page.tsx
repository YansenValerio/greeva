import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/shared/Container';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CategoryFilter } from '@/components/catalog/CategoryFilter';
import { SearchBar } from '@/components/catalog/SearchBar';
import { Pagination } from '@/components/shared/Pagination';
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
          <div className="mt-6">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
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

          {/* Label hasil pencarian */}
          {searchParams.search && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Hasil pencarian untuk:{' '}
                <span className="font-semibold text-greeva-black">
                  &ldquo;{searchParams.search}&rdquo;
                </span>
                {' '}
                <span className="text-gray-400">
                  ({productsRes.meta?.total ?? productsRes.data.length} produk)
                </span>
              </p>
            </div>
          )}

          {/* Grid produk */}
          <ProductGrid products={productsRes.data ?? []} />

          {/* Pagination */}
          {productsRes.meta && productsRes.meta.last_page > 1 && (
            <Suspense>
              <Pagination
                currentPage={productsRes.meta.current_page}
                lastPage={productsRes.meta.last_page}
                className="mt-10"
              />
            </Suspense>
          )}
        </Container>
      </section>
    </main>
  );
}
