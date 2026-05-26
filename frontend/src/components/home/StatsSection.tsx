'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '80–85%', label: 'Bagi hasil untuk setiap mitra brand' },
  { value: '2+',     label: 'Mitra brand hijau lokal aktif' },
  { value: '100%',   label: 'Material daur ulang & berkelanjutan' },
];

export function StatsSection() {
  return (
    <section className="bg-greeva-sand-warm py-20 md:py-28">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y divide-greeva-forest-dark/10 md:grid-cols-3 md:divide-y-0 md:divide-x">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 1, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col items-center justify-center py-10 md:py-0 md:px-12 text-center"
            >
              <span className="text-[4.5rem] font-bold leading-none tracking-tight text-greeva-forest-dark">
                {value}
              </span>
              <span className="mt-3 text-sm text-gray-500 max-w-[160px] leading-snug">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
