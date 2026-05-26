'use client';

import Link from 'next/link';

const partners = [
  { name: 'Notic', tagline: 'Aksesoris HDPE Daur Ulang', href: '/shop?partner=notic' },
  { name: 'Reperca', tagline: 'Produk Serbaguna Kain Perca', href: '/shop?partner=reperca' },
  { name: 'Segera Hadir', tagline: 'Mitra baru dalam kurasi', href: '#' },
];

export function PartnerStrip() {
  return (
    <section className="bg-greeva-sand-warm border-y border-greeva-mint-light/60 py-12">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-greeva-forest-dark/60">
          Dari Mitra Terpilih
        </p>
        <div className="flex flex-col items-center justify-center gap-10 sm:flex-row sm:gap-16">
          {partners.map((partner) => (
            <Link
              key={partner.name}
              href={partner.href}
              className="group flex flex-col items-center gap-1.5 opacity-60 transition-opacity duration-200 hover:opacity-100"
            >
              <span className="text-2xl font-bold tracking-tight text-greeva-forest-dark">
                {partner.name}
              </span>
              <span className="text-[11px] uppercase tracking-[0.1em] text-greeva-forest-dark/70">
                {partner.tagline}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
