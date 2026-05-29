import type { Metadata } from 'next';
import { Container } from '@/components/shared/Container';

export const metadata: Metadata = {
  title: 'Kontak & Kemitraan',
  description: 'Hubungi Greeva untuk pertanyaan, kerja sama, atau pengajuan kemitraan brand hijau.',
};

export default function KontakPage() {
  return (
    <main className="pb-24 pt-16">
      <Container>
        <div className="mx-auto max-w-2xl">
          <p className="text-caption uppercase tracking-[0.1em] text-greeva-starbucks-green">
            Hubungi Kami
          </p>
          <h1 className="mt-3 text-h1 font-bold text-greeva-black">Mari berbicara.</h1>
          <p className="mt-4 text-body-lg text-gray-600">
            Ada pertanyaan tentang produk, ingin mengajukan kemitraan brand, atau hanya ingin menyapa?
            Kami dengan senang hati mendengar.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-card bg-greeva-mint-light/40 p-6">
              <h2 className="font-semibold text-greeva-forest-dark">Layanan Pembeli</h2>
              <p className="mt-2 text-sm text-gray-600">
                Pertanyaan tentang pesanan, pengiriman, atau produk.
              </p>
              <a
                href="mailto:halo@greeva.id"
                className="mt-3 block text-sm font-medium text-greeva-starbucks-green hover:underline"
              >
                halo@greeva.id
              </a>
              <p className="mt-1 text-xs text-gray-400">Respons dalam 1×24 jam kerja</p>
            </div>

            <div className="rounded-card bg-greeva-sand-warm p-6">
              <h2 className="font-semibold text-greeva-forest-dark">Kemitraan Brand</h2>
              <p className="mt-2 text-sm text-gray-600">
                Ingin mendaftarkan brand hijau kamu ke Greeva?
              </p>
              <a
                href="mailto:mitra@greeva.id"
                className="mt-3 block text-sm font-medium text-greeva-starbucks-green hover:underline"
              >
                mitra@greeva.id
              </a>
              <p className="mt-1 text-xs text-gray-400">Tim kurasi akan menghubungi dalam 3 hari kerja</p>
            </div>

            <div className="rounded-card bg-white p-6 shadow-card md:col-span-2">
              <h2 className="font-semibold text-greeva-black">Media & Pers</h2>
              <p className="mt-2 text-sm text-gray-600">
                Untuk liputan media, wawancara, atau kolaborasi konten.
              </p>
              <a
                href="mailto:media@greeva.id"
                className="mt-3 block text-sm font-medium text-greeva-starbucks-green hover:underline"
              >
                media@greeva.id
              </a>
            </div>
          </div>

          <div className="mt-12 rounded-card border border-greeva-mint-light p-6">
            <h2 className="font-semibold text-greeva-black">Kriteria Mitra Greeva</h2>
            <p className="mt-2 text-sm text-gray-600">
              Kami membuka kemitraan untuk brand yang memenuhi kriteria berikut:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {[
                'Berbasis di Indonesia (founder atau produksi)',
                'Menggunakan bahan daur ulang, limbah, atau bahan alami berkelanjutan',
                'Punya kapasitas produksi yang konsisten (minimal 50 unit/bulan)',
                'Terdaftar sebagai badan usaha atau memiliki NIB',
                'Bersedia menjalani proses kurasi dan audit kualitas',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-greeva-forest">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}
