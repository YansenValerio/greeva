import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { getProducts } from '@/lib/api/products';

async function getFeaturedProducts() {
  try {
    const res = await getProducts({ per_page: 4 });
    return res.data;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-greeva-emerald px-4 py-20 text-white md:py-28 lg:py-36">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-caption uppercase tracking-[0.08em] text-greeva-leaf">
              Konsinyasi Brand Hijau Lokal
            </p>
            <h1 className="mt-4 text-display font-bold text-white text-balance">
              Brand hijau lokal yang layak didengar.
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
              Greeva mengkurasi dan memasarkan produk dari brand lokal Indonesia yang
              berkomitmen pada keberlanjutan — dari aksesoris daur ulang hingga produk
              berbahan perca.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-pill bg-greeva-forest px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-greeva-starbucks-green hover:scale-[1.02]"
              >
                Belanja Sekarang
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-pill border border-white/40 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                Kenali Mitra Kami
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Impact strip ─────────────────────────────────────────────────── */}
      <section className="bg-greeva-sand-warm py-10">
        <Container>
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {[
              { label: 'Mitra Brand', value: '2+' },
              { label: 'Bagi Hasil Mitra', value: '80–85%' },
              { label: 'Material Daur Ulang', value: '100%' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-greeva-forest-dark">{value}</p>
                <p className="mt-1 text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Produk Terbaru ────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 md:py-20">
          <Container>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-caption uppercase tracking-[0.08em] text-greeva-starbucks-green">
                  Pilihan Terkurasi
                </p>
                <h2 className="mt-1 text-h2 font-semibold text-greeva-black">Produk Terbaru</h2>
              </div>
              <Link
                href="/shop"
                className="text-sm font-medium text-greeva-starbucks-green hover:underline"
              >
                Lihat semua →
              </Link>
            </div>
            <ProductGrid products={featured} />
          </Container>
        </section>
      )}

      {/* ── Brand story ──────────────────────────────────────────────────── */}
      <section className="bg-greeva-mint-light py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-caption uppercase tracking-[0.08em] text-greeva-starbucks-green">
              Misi Kami
            </p>
            <h2 className="mt-3 text-h2 font-semibold text-greeva-black">
              Sustainable brands deserve better marketing.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gray-700">
              Greeva bukan sekadar marketplace. Kami adalah agency sekaligus platform
              konsinyasi — mengelola seluruh marketing, konten, dan distribusi untuk mitra
              brand hijau lokal. Mitra fokus pada produksi, kami yang garap sisanya.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
              {[
                {
                  brand: 'Notic',
                  desc: 'Aksesoris manik cantik dari plastik HDPE daur ulang.',
                },
                {
                  brand: 'Reperca',
                  desc: 'Tas dan pouch serbaguna dari kain perca sisa konveksi.',
                },
              ].map(({ brand, desc }) => (
                <div key={brand} className="rounded-card bg-white p-6 shadow-card">
                  <p className="font-semibold text-greeva-forest-dark">{brand}</p>
                  <p className="mt-1 text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
