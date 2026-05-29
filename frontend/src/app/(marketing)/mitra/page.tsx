import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';

export const metadata: Metadata = {
  title: 'Mitra Greeva',
  description: 'Kenali brand hijau lokal yang bermitra dengan Greeva — Notic dan Reperca.',
};

const PARTNERS = [
  {
    slug: 'notic',
    name: 'Notic',
    tagline: 'Aksesoris manik dari plastik HDPE daur ulang',
    description:
      'Notic mengubah sampah plastik HDPE menjadi aksesoris manik yang berwarna, tahan lama, dan punya cerita. Setiap gelang yang kamu pakai adalah satu botol plastik yang tidak berakhir di laut.',
    color: 'bg-greeva-mint-light',
    products: ['Gelang manik', 'Coaster', 'Aksesori rumah'],
  },
  {
    slug: 'reperca',
    name: 'Reperca',
    tagline: 'Produk serbaguna dari kain perca sisa konveksi',
    description:
      'Reperca bekerja sama dengan konveksi lokal untuk mengumpulkan kain perca yang seharusnya dibuang, lalu mengolahnya menjadi tote bag, pouch, dan produk fungsional lainnya yang indah.',
    color: 'bg-greeva-sand-warm',
    products: ['Tote bag', 'Pouch', 'Produk fashion'],
  },
];

export default function MitraPage() {
  return (
    <main className="pb-24 pt-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-caption uppercase tracking-[0.1em] text-greeva-starbucks-green">
            Mitra Kami
          </p>
          <h1 className="mt-3 text-h1 font-bold text-greeva-black">
            Brand lokal yang kami percaya.
          </h1>
          <p className="mt-4 text-body-lg text-gray-600">
            Setiap mitra Greeva melalui proses kurasi ketat — kami hanya bermitra dengan brand yang
            punya komitmen nyata terhadap keberlanjutan.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {PARTNERS.map((partner) => (
            <Link
              key={partner.slug}
              href={`/mitra/${partner.slug}`}
              className={`group rounded-2xl ${partner.color} p-8 transition-transform hover:-translate-y-1`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-greeva-forest/20">
                <span className="text-lg font-bold text-greeva-forest-dark">{partner.name[0]}</span>
              </div>
              <h2 className="text-2xl font-bold text-greeva-black">{partner.name}</h2>
              <p className="mt-1 text-sm font-medium text-greeva-forest-dark">{partner.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{partner.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {partner.products.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-greeva-forest-dark"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm font-semibold text-greeva-starbucks-green group-hover:underline">
                Lihat produk {partner.name} →
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-20 rounded-card bg-greeva-emerald p-10 text-center text-white">
          <h2 className="text-2xl font-bold">Punya brand hijau?</h2>
          <p className="mt-3 text-white/80">
            Greeva membuka pintu untuk brand lokal baru yang serius dengan keberlanjutan.
          </p>
          <Link
            href="/kontak"
            className="mt-6 inline-block rounded-pill bg-white px-8 py-3 font-semibold text-greeva-forest-dark hover:bg-greeva-mint-light transition-colors"
          >
            Ajukan Kemitraan
          </Link>
        </div>
      </Container>
    </main>
  );
}
