import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';

export const metadata: Metadata = {
  title: 'Tentang Greeva',
  description: 'Greeva adalah ekosistem kurasi brand hijau lokal Indonesia. Kami percaya brand keberlanjutan layak mendapatkan marketing yang lebih baik.',
};

export default function TentangPage() {
  return (
    <main className="pb-24 pt-16">
      <Container>
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-caption uppercase tracking-[0.1em] text-greeva-starbucks-green">
            Tentang Kami
          </p>
          <h1 className="mt-3 text-h1 font-bold text-greeva-black">
            Brand hijau lokal yang layak didengar.
          </h1>
          <p className="mt-5 text-body-lg leading-relaxed text-gray-600">
            Greeva lahir dari keyakinan sederhana: produk berkelanjutan buatan lokal Indonesia 
            seharusnya punya ruang yang lebih besar di pasar, bukan bersaing dengan keterbatasan 
            marketing dan distribusi.
          </p>
        </div>

        {/* Misi */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: 'Kurasi, bukan marketplace',
              body: 'Kami memilih mitra dengan standar ketat. Setiap brand yang masuk Greeva sudah melalui proses kurasi — bahan baku, proses produksi, hingga dampak sosialnya.',
            },
            {
              title: 'Marketing kami, produk mereka',
              body: 'Mitra fokus pada kualitas produk. Greeva yang menangani seluruh marketing: fotografi, copywriting, SEO, iklan, dan media sosial.',
            },
            {
              title: 'Model konsinyasi yang adil',
              body: 'Mitra mendapat 80–85% dari setiap transaksi sukses. Tidak ada biaya awal, tidak ada risiko stok mandeg — hanya bagi hasil yang jelas dan transparan.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-card bg-greeva-mint-light/40 p-6">
              <h3 className="font-semibold text-greeva-forest-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Cerita */}
        <div className="mt-20 rounded-card bg-greeva-sand-warm p-10 md:p-14">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-h2 font-bold text-greeva-black">Kenapa Greeva?</h2>
            <div className="mt-6 space-y-4 text-body leading-relaxed text-gray-700">
              <p>
                Di Indonesia, ribuan brand kecil membuat produk-produk luar biasa dari bahan daur ulang,
                limbah konveksi, dan material lokal. Tapi sebagian besar tidak punya bandwidth untuk 
                berkompetisi di dunia digital yang serba cepat.
              </p>
              <p>
                Greeva hadir sebagai mitra strategis — bukan hanya platform jual-beli. Kami menginvestasikan 
                sumber daya marketing kami ke brand-brand ini, dan kami sukses bersama ketika produk mereka terjual.
              </p>
              <p>
                <em>Sustainable brands deserve better marketing.</em>
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-h2 font-bold text-greeva-black">Bergabunglah bersama kami</h2>
          <p className="mt-3 text-gray-600">Punya brand hijau yang ingin menjangkau lebih banyak pembeli?</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/kontak"
              className="rounded-pill bg-greeva-forest px-8 py-3 font-semibold text-white hover:bg-greeva-starbucks-green transition-colors"
            >
              Daftarkan Brand
            </Link>
            <Link
              href="/shop"
              className="rounded-pill border border-greeva-forest-dark px-8 py-3 font-semibold text-greeva-forest-dark hover:bg-greeva-mint-light transition-colors"
            >
              Lihat Produk
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
