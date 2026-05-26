'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StoryPartner {
  name: string;
  eyebrow: string;
  headline: string;
  body: string;
  href: string;
  imageSrc: string | null;
  imageAlt: string;
  imageBg: string;
  imageEmoji: string;
  flip?: boolean;
}

interface StorySectionProps {
  partner: StoryPartner;
}

export function StorySection({ partner }: StorySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  const imagePanel = (
    <motion.div
      initial={{ opacity: 0, x: partner.flip ? 40 : -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden"
      style={{ minHeight: '480px' }}
    >
      {partner.imageSrc ? (
        <Image
          src={partner.imageSrc}
          alt={partner.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ backgroundColor: partner.imageBg, minHeight: '480px' }}
        >
          <span className="text-9xl select-none" role="img" aria-hidden="true">
            {partner.imageEmoji}
          </span>
        </div>
      )}
    </motion.div>
  );

  const textPanel = (
    <motion.div
      initial={{ opacity: 0, x: partner.flip ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-20 lg:px-20"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-greeva-forest-dark/60">
        {partner.eyebrow}
      </p>
      <h2
        className="mt-4 text-greeva-black"
        style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', maxWidth: '480px' }}
      >
        {partner.headline}
      </h2>
      <p
        className="mt-5 leading-[1.75] text-greeva-text-body"
        style={{ fontSize: '17px', maxWidth: '480px' }}
      >
        {partner.body}
      </p>
      <Link
        href={partner.href}
        className="mt-8 inline-flex w-fit items-center gap-1 text-sm font-semibold text-greeva-forest-dark underline-offset-4 decoration-[1.5px] hover:underline hover:[text-decoration-thickness:2px] transition-all"
      >
        Lihat produk {partner.name} →
      </Link>
    </motion.div>
  );

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2">
      {partner.flip ? (
        <>
          {textPanel}
          {imagePanel}
        </>
      ) : (
        <>
          {imagePanel}
          {textPanel}
        </>
      )}
    </div>
  );
}

export const noticStory: StoryPartner = {
  name: 'Notic',
  eyebrow: 'Mitra Sejak 2024',
  headline: 'Cerita di balik Notic.',
  body: 'Setiap manik gelang Notic dibuat dari plastik HDPE daur ulang — botol dan wadah yang seharusnya berakhir di TPA. Lewat proses upcycling yang hati-hati, Notic mengubahnya menjadi aksesoris yang kuat, berwarna, dan bermakna.',
  href: '/shop?partner=notic',
  imageSrc: null,
  imageAlt: 'Pengrajin Notic sedang membuat gelang dari plastik HDPE daur ulang',
  imageBg: '#D1FAE5',
  imageEmoji: '📿',
  flip: false,
};

export const repercaStory: StoryPartner = {
  name: 'Reperca',
  eyebrow: 'Mitra Sejak 2024',
  headline: 'Cerita di balik Reperca.',
  body: 'Sisa kain konveksi yang dulu terbuang, kini menjadi tas tote, pouch, dan produk harian yang fungsional. Reperca membuktikan bahwa "limbah" hanyalah soal perspektif — dan setiap sentimeter kain punya potensi untuk berguna.',
  href: '/shop?partner=reperca',
  imageSrc: null,
  imageAlt: 'Produk Reperca dari kain perca sisa konveksi',
  imageBg: '#F5F0E8',
  imageEmoji: '👜',
  flip: true,
};
