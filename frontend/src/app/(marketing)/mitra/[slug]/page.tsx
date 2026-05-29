import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { getProducts } from '@/lib/api/products';

interface Params {
  params: { slug: string };
}

const PARTNER_DATA: Record<
  string,
  {
    name: string;
    tagline: string;
    description: string[];
    values: { title: string; body: string }[];
    impact: { stat: string; label: string }[];
  }
> = {
  notic: {
    name: 'Notic',
    tagline: 'Mengubah sampah plastik menjadi aksesoris yang punya cerita.',
    description: [
      'Notic didirikan dengan satu pertanyaan sederhana: apa yang terjadi pada botol plastik setelah kita buang? Jawabannya tidak menyenangkan — tapi Notic memilih untuk menjadi bagian dari solusinya.',
      'Dengan mengumpulkan plastik HDPE daur ulang dari komunitas dan melebur ulang menjadi manik-manik berwarna, Notic menciptakan aksesoris yang bukan hanya indah, tapi juga bermakna.',
      'Setiap produk Notic hadir dengan nomor identifikasi yang melacak perjalanan plastiknya — dari pengumpulan hingga ke tanganmu.',
    ],
    values: [
      {
        title: 'Bahan Daur Ulang',
        body: 'Seluruh bahan baku adalah plastik HDPE yang dikumpulkan dan diverifikasi dari komunitas pengepul lokal.',
      },
      {
        title: 'Produksi Lokal',
        body: 'Setiap produk dibuat tangan oleh pengrajin lokal di workshop Notic — tidak ada produksi massal di pabrik besar.',
      },
      {
        title: 'Transparansi Penuh',
        body: 'Notic membuka data dampak setiap kuartal: berapa kg plastik yang diselamatkan, berapa pengrajin yang terlibat.',
      },
    ],
    impact: [
      { stat: '2.4 ton', label: 'Plastik diselamatkan' },
      { stat: '18', label: 'Pengrajin aktif' },
      { stat: '4.8★', label: 'Rata-rata rating' },
    ],
  },
  reperca: {
    name: 'Reperca',
    tagline: 'Kain sisa konveksi yang diubah menjadi produk yang kamu butuhkan sehari-hari.',
    description: [
      'Industri fashion adalah salah satu penyumbang limbah terbesar di dunia. Di setiap konveksi, ada tumpukan kain perca yang tidak terpakai — terlalu kecil untuk produksi, terlalu besar untuk dibuang begitu saja.',
      'Reperca hadir untuk menutup celah ini. Dengan bermitra langsung dengan konveksi lokal, Reperca mengumpulkan kain perca ini dan mengolahnya menjadi produk fungsional yang kamu gunakan setiap hari.',
      'Hasilnya adalah produk yang punya karakter — setiap tote bag dan pouch dari Reperca unik, karena kombinasi kain yang digunakan tidak pernah persis sama.',
    ],
    values: [
      {
        title: 'Zero Waste by Design',
        body: 'Tidak ada kain yang dibuang dalam proses produksi Reperca — setiap potongan punya tujuan.',
      },
      {
        title: 'Bermitra dengan UMKM',
        body: 'Reperca tidak punya pabrik sendiri. Mereka memberdayakan konveksi kecil dan penjahit rumahan sebagai mitra produksi.',
      },
      {
        title: 'Produk Fungsional',
        body: 'Setiap produk dirancang untuk benar-benar dipakai — bukan sekadar aksesoris dekorasi.',
      },
    ],
    impact: [
      { stat: '840 kg', label: 'Kain perca dimanfaatkan' },
      { stat: '12', label: 'UMKM konveksi bermitra' },
      { stat: '4.9★', label: 'Rata-rata rating' },
    ],
  },
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const partner = PARTNER_DATA[params.slug];
  if (!partner) return { title: 'Mitra Tidak Ditemukan' };
  return {
    title: `${partner.name} — Mitra Greeva`,
    description: partner.tagline,
  };
}

export default async function PartnerBrandPage({ params }: Params) {
  const partner = PARTNER_DATA[params.slug];
  if (!partner) notFound();

  const productsRes = await getProducts({ per_page: 4 }).catch(() => ({ data: [] }));

  return (
    <main className="pb-24 pt-16">
      <Container>
        <Link href="/mitra" className="mb-8 inline-block text-sm text-greeva-starbucks-green hover:underline">
          ← Semua Mitra
        </Link>

        {/* Hero brand */}
        <div className="rounded-2xl bg-greeva-emerald px-8 py-12 text-white md:px-16">
          <p className="text-caption uppercase tracking-[0.1em] text-white/60">Mitra Greeva</p>
          <h1 className="mt-2 text-h1 font-bold">{partner.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/80">{partner.tagline}</p>
          <div className="mt-8 flex gap-8">
            {partner.impact.map((i) => (
              <div key={i.label}>
                <p className="text-2xl font-bold">{i.stat}</p>
                <p className="mt-0.5 text-sm text-white/70">{i.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cerita */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-h2 font-bold text-greeva-black">Cerita {partner.name}</h2>
            <div className="mt-4 space-y-4 text-body leading-relaxed text-gray-700">
              {partner.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {partner.values.map((v) => (
              <div key={v.title} className="rounded-card bg-greeva-mint-light/40 p-5">
                <h3 className="text-sm font-semibold text-greeva-forest-dark">{v.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Produk */}
        {productsRes.data.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 text-h2 font-bold text-greeva-black">Produk {partner.name}</h2>
            <FeaturedProducts products={productsRes.data} />
            <div className="mt-8 text-center">
              <Link
                href="/shop"
                className="rounded-pill border border-greeva-forest-dark px-8 py-3 font-semibold text-greeva-forest-dark hover:bg-greeva-mint-light transition-colors"
              >
                Lihat Semua Produk →
              </Link>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
