'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: '2.500+', unit: 'kg', label: 'plastik HDPE diolah menjadi produk' },
  { value: '2', unit: '', label: 'mitra brand hijau terkurasi' },
  { value: '100+', unit: '', label: 'produk tersedia di platform' },
];

export function ImpactStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section ref={ref} className="bg-greeva-emerald py-16 md:py-20">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col items-center text-center"
            >
              <div className="font-bold text-white tabular-nums" style={{ fontSize: 'clamp(40px, 5vw, 56px)', lineHeight: 1 }}>
                {stat.value}
                {stat.unit && (
                  <span className="ml-1 text-3xl font-semibold text-greeva-leaf">{stat.unit}</span>
                )}
              </div>
              <p className="mt-3 text-[13px] font-medium uppercase tracking-[0.1em] text-white/70">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
