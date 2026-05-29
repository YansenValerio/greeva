'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Category } from '@/types/category';

interface CategoryGridProps {
  categories: Category[];
}

const fallbackCategories = [
  { name: 'Aksesoris', slug: 'aksesoris', description: 'Gelang, coaster & lebih banyak lagi', image: null },
  { name: 'Tas & Pouch', slug: 'tas-pouch', description: 'Tote bag, pouch, dan tas harian', image: null },
  { name: 'Home Living', slug: 'home-living', description: 'Produk untuk rumah yang berkelanjutan', image: null },
  { name: 'Untuk Kantor', slug: 'kantor', description: 'Pilihan ramah lingkungan di kantor', image: null },
];

export function CategoryGrid({ categories }: CategoryGridProps) {
  const items = categories.length > 0 ? categories.slice(0, 4) : fallbackCategories;

  const bgColors = ['#D1FAE5', '#F5F0E8', '#D1FAE5', '#32462F'];
  const emojis = ['📿', '👜', '🏡', '💼'];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-greeva-forest-dark/60">
            Koleksi Kami
          </p>
          <h2
            className="mt-3 text-greeva-black"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' }}
          >
            Belanja per Kategori
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group block overflow-hidden rounded-card"
              >
                {/* Image area — 4:3 aspect ratio */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]"
                      style={{ backgroundColor: bgColors[i % bgColors.length] }}
                    >
                      <span className="text-6xl select-none" role="img" aria-hidden="true">
                        {emojis[i % emojis.length]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text below image */}
                <div className="pt-4 pb-1">
                  <h3
                    className="font-semibold text-greeva-black transition-colors group-hover:text-greeva-starbucks-green"
                    style={{ fontSize: '18px', lineHeight: 1.3 }}
                  >
                    <span className="border-b border-transparent group-hover:border-greeva-starbucks-green transition-all duration-200">
                      {cat.name}
                    </span>
                  </h3>
                  {cat.description && (
                    <p className="mt-1 text-sm leading-snug text-greeva-text-body/70">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
