'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative -mt-16 overflow-hidden" style={{ minHeight: '85vh' }}>
      {/* Background — replace with actual lifestyle photo via next/image when available */}
      <div className="absolute inset-0" style={{ backgroundColor: '#006242' }}>
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '300px 300px',
          }}
        />
        {/* Directional gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#004d34] via-[#006242] to-[#003d28]" />
        {/* Bottom fade for text legibility */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content — bottom-left aligned (Vitra style) */}
      <div
        className="relative flex flex-col justify-end px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"
        style={{ minHeight: '85vh' }}
      >
        <div className="mx-auto w-full max-w-container">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-greeva-leaf"
          >
            Brand Hijau Lokal Indonesia
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-4 max-w-3xl font-bold text-white"
            style={{ fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            Brand hijau lokal<br />
            yang layak didengar.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-5 max-w-md leading-relaxed text-white/80"
            style={{ fontSize: '18px' }}
          >
            Kurasi terbaik dari mitra ekonomi sirkular Indonesia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-8"
          >
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-pill border border-white px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white hover:text-greeva-forest-dark hover:scale-[1.02]"
            >
              Jelajahi Koleksi →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
