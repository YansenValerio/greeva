'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/category';

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') ?? '';

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setCategory('')}
        className={cn(
          'rounded-pill px-4 py-1.5 text-sm font-medium transition-colors',
          !active
            ? 'bg-greeva-forest text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-greeva-mint-light',
        )}
      >
        Semua Produk
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(cat.slug)}
          className={cn(
            'rounded-pill px-4 py-1.5 text-sm font-medium transition-colors',
            active === cat.slug
              ? 'bg-greeva-forest text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-greeva-mint-light',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
