'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Price } from '@/components/shared/Price';
import { getRecentlyViewed, type RecentProduct } from '@/lib/recentlyViewed';

export function RecentlyViewed({ currentId }: { currentId: number }) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed().filter((p) => p.id !== currentId));
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="mb-6 text-h2 font-bold text-greeva-black">Pernah Dilihat</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="group block">
            <div className="overflow-hidden rounded-card bg-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
              <div className="relative aspect-square overflow-hidden bg-greeva-mint-light">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-greeva-black">
                  {p.name}
                </p>
                <Price
                  cents={p.price}
                  className="mt-1 block text-sm font-semibold text-greeva-forest-dark"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
