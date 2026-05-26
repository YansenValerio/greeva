'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/catalog/ProductCard';
import type { Product } from '@/types/product';

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-greeva-forest-dark/60">
              Pilihan Terkurasi
            </p>
            <h2
              className="mt-2 text-greeva-black"
              style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' }}
            >
              Produk Pilihan Minggu Ini
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-greeva-forest-dark underline-offset-4 hover:underline"
          >
            Lihat semua →
          </Link>
        </motion.div>

        {/* 4-col even grid (Bite-style) */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
