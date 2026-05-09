import Image from 'next/image';
import Link from 'next/link';
import { Price } from '@/components/shared/Price';
import { Badge } from '@/components/shared/Badge';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0] ?? null;
  const hasDiscount =
    product.compare_price !== null && product.compare_price > product.price;
  const outOfStock = product.total_stock === 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-card bg-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
        {/* Gambar */}
        <div className="relative aspect-square overflow-hidden bg-greeva-mint-light">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-caption uppercase tracking-widest text-greeva-forest-dark/30">
                Foto belum tersedia
              </span>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute left-2 top-2">
              <Badge variant="amber">Diskon</Badge>
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-pill bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <p className="mb-1 text-caption uppercase tracking-[0.08em] text-greeva-starbucks-green">
              {product.category.name}
            </p>
          )}
          <h3 className="line-clamp-2 font-semibold leading-snug text-greeva-black">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <Price cents={product.price} className="font-semibold text-greeva-forest-dark" />
            {hasDiscount && (
              <Price
                cents={product.compare_price!}
                className="text-sm text-gray-400 line-through"
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
