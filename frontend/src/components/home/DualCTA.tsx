'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function DualCTA() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Buyer CTA */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col items-center justify-center px-8 py-20 text-center md:px-16 md:py-24"
        style={{ backgroundColor: '#006242' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-greeva-leaf">
          Untuk Pembeli
        </p>
        <h2
          className="mt-4 max-w-xs text-white"
          style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' }}
        >
          Temukan produk lokal terbaik.
        </h2>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-white/75">
          Belanja produk hijau pilihan yang benar-benar peduli lingkungan.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center justify-center rounded-pill bg-white px-8 py-3.5 text-sm font-semibold text-greeva-forest-dark transition-all hover:bg-greeva-mint-light hover:scale-[1.02]"
        >
          Belanja Sekarang
        </Link>
      </motion.div>

      {/* Partner CTA */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center justify-center px-8 py-20 text-center md:px-16 md:py-24"
        style={{ backgroundColor: '#D1FAE5' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-greeva-forest-dark/60">
          Untuk Brand
        </p>
        <h2
          className="mt-4 max-w-xs text-greeva-forest-dark"
          style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' }}
        >
          Anda brand hijau juga?
        </h2>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-greeva-forest-dark/70">
          Mari berkolaborasi dengan Greeva. Kami tangani marketing, Anda fokus produksi.
        </p>
        <Link
          href="/partner/daftar"
          className="mt-8 inline-flex items-center justify-center rounded-pill bg-greeva-forest px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-greeva-starbucks-green hover:scale-[1.02]"
        >
          Daftar sebagai Mitra
        </Link>
      </motion.div>
    </section>
  );
}
