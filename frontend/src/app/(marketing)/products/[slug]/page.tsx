import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import { ProductImageGallery } from '@/components/catalog/ProductImageGallery';
import { AddToCartButton } from '@/components/catalog/AddToCartButton';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { RecentlyViewed } from '@/components/catalog/RecentlyViewed';
import { TrackRecentlyViewed } from '@/components/catalog/TrackRecentlyViewed';
import { StarRating } from '@/components/reviews/StarRating';
import { ReviewList } from '@/components/reviews/ReviewList';
import { getProductBySlug, getRelatedProducts } from '@/lib/api/products';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://greeva.id';
  try {
    const product = await getProductBySlug(params.slug);
    const image = product.images?.[0] ?? null;
    return {
      title: product.meta_title ?? product.name,
      description: product.meta_description ?? product.short_description ?? undefined,
      openGraph: {
        title: product.meta_title ?? product.name,
        description: product.meta_description ?? product.short_description ?? undefined,
        url: `${baseUrl}/products/${product.slug}`,
        images: image ? [{ url: image }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.meta_title ?? product.name,
        description: product.meta_description ?? product.short_description ?? undefined,
        images: image ? [image] : [],
      },
    };
  } catch {
    return { title: 'Produk Tidak Ditemukan' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product;
  try {
    product = await getProductBySlug(params.slug);
  } catch {
    notFound();
  }

  const related = await getRelatedProducts(params.slug).catch(() => []);

  const hasDiscount =
    product.compare_price !== null && product.compare_price > product.price;
  const outOfStock = product.total_stock === 0;

  const allImages = [
    ...product.images,
    ...(product.variants?.flatMap((v) => v.images) ?? []),
  ];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://greeva.id';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description ?? product.description ?? undefined,
    image: product.images,
    url: `${baseUrl}/products/${product.slug}`,
    brand: { '@type': 'Brand', name: product.partner?.name ?? 'Greeva' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: (product.price / 100).toFixed(0),
      availability: product.total_stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Greeva' },
    },
    ...(product.reviews_count > 0 && product.average_rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.average_rating.toFixed(1),
            reviewCount: product.reviews_count,
          },
        }
      : {}),
  };

  return (
    <main className="py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-greeva-starbucks-green transition-colors">
            Toko
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-greeva-starbucks-green transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-greeva-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
          {/* Galeri Gambar */}
          <ProductImageGallery images={allImages} productName={product.name} />

          {/* Info Produk */}
          <div>
            {product.category && (
              <p className="mb-2 text-caption uppercase tracking-[0.08em] text-greeva-starbucks-green">
                {product.category.name}
              </p>
            )}

            <h1 className="text-h1 font-bold text-greeva-black text-balance leading-tight">
              {product.name}
            </h1>

            {/* Rating ringkas */}
            {product.reviews_count > 0 && (
              <a
                href="#reviews"
                className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-greeva-starbucks-green transition-colors"
              >
                <StarRating value={product.average_rating ?? 0} size={14} />
                <span>
                  {product.average_rating?.toFixed(1)} · {product.reviews_count} ulasan
                </span>
              </a>
            )}

            {/* Harga */}
            <div className="mt-4 flex items-baseline gap-3">
              <Price
                cents={product.price}
                className="text-2xl font-bold text-greeva-forest-dark"
              />
              {hasDiscount && (
                <Price
                  cents={product.compare_price!}
                  className="text-base text-gray-400 line-through"
                />
              )}
            </div>

            {/* Status stok */}
            {outOfStock && !product.variants?.length && (
              <Badge variant="gray" className="mt-3">
                Stok Habis
              </Badge>
            )}

            {/* Sustainability */}
            {product.sustainability_notes && (
              <div className="mt-6 rounded-card bg-greeva-mint-light p-4">
                <p className="mb-1 text-sm font-semibold text-greeva-forest-dark">
                  Catatan Keberlanjutan
                </p>
                <p className="text-sm leading-relaxed text-greeva-forest-dark/80">
                  {product.sustainability_notes}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-6">
              <AddToCartButton
                variants={product.variants ?? []}
                defaultPrice={product.price}
                totalStock={product.total_stock}
              />
            </div>

            {/* Deskripsi */}
            {product.description && (
              <div className="mt-10 border-t border-gray-100 pt-8">
                <h2 className="mb-3 text-h3 font-semibold text-greeva-black">Deskripsi</h2>
                <div className="whitespace-pre-line text-base leading-relaxed text-greeva-text-body">
                  {product.description}
                </div>
              </div>
            )}

            {/* Detail */}
            {(product.material || product.weight) && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h2 className="mb-3 text-h3 font-semibold text-greeva-black">Detail Produk</h2>
                <dl className="space-y-2 text-sm">
                  {product.material && (
                    <div className="flex gap-4">
                      <dt className="w-24 flex-shrink-0 text-gray-500">Bahan</dt>
                      <dd className="text-greeva-text-body">{product.material}</dd>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex gap-4">
                      <dt className="w-24 flex-shrink-0 text-gray-500">Berat</dt>
                      <dd className="text-greeva-text-body">{product.weight} gram</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Mitra */}
            {product.partner && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-400">
                  Diproduksi oleh{' '}
                  <span className="font-medium text-greeva-forest-dark">
                    {product.partner.name}
                  </span>{' '}
                  · Didistribusikan oleh Greeva
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section ulasan */}
        <section id="reviews" className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="mb-6 text-h2 font-bold text-greeva-black">Ulasan Pembeli</h2>
          <ReviewList slug={product.slug} />
        </section>

        {/* Produk serupa */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-gray-100 pt-10">
            <h2 className="mb-6 text-h2 font-bold text-greeva-black">Produk Serupa</h2>
            <ProductGrid products={related} />
          </section>
        )}

        {/* Pernah dilihat */}
        <RecentlyViewed currentId={product.id} />
      </Container>

      {/* Catat produk ini ke riwayat "pernah dilihat" (client, render null) */}
      <TrackRecentlyViewed
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? null,
          price: product.price,
        }}
      />
    </main>
  );
}
