'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: 'Kualitas gelang Notic di luar ekspektasi. Maniknya kokoh, warnanya tetap cerah setelah berbulan-bulan dipakai.',
    author: 'Sari W.',
    location: 'Jakarta',
    product: 'Gelang Wave Notic',
    initials: 'SW',
  },
  {
    quote: 'Tote bag Reperca pas banget buat bawa buku dan laptop. Jahitannya rapi, dan saya suka tau produknya dari kain sisa konveksi.',
    author: 'Dimas R.',
    location: 'Bandung',
    product: 'Tote Bag Reperca',
    initials: 'DR',
  },
  {
    quote: 'Senang belanja di Greeva karena bisa tau cerita di balik produknya. Beda dari marketplace biasa.',
    author: 'Maya P.',
    location: 'Surabaya',
    product: 'Coaster Set Notic',
    initials: 'MP',
  },
];

export function SocialProof() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-greeva-forest-dark/60">
            Dari Pelanggan Kami
          </p>
          <h2 className="mt-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', color: '#1C1C1C' }}>
            Apa kata pembeli Greeva?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex flex-col gap-5 rounded-2xl border border-greeva-mint-light bg-white p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-greeva-leaf text-greeva-leaf"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-[15px] italic leading-relaxed text-greeva-text-body">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3 border-t border-greeva-mint-light pt-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-greeva-mint-light text-[11px] font-bold text-greeva-forest-dark">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-greeva-black">{t.author}</p>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-greeva-forest-dark/60">
                    {t.product} · {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
