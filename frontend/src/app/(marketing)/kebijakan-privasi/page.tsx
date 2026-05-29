import type { Metadata } from 'next';
import { Container } from '@/components/shared/Container';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi Greeva — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi kamu.',
};

const LAST_UPDATED = '1 Mei 2026';

export default function KebijakanPrivasiPage() {
  return (
    <main className="pb-24 pt-16">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-h1 font-bold text-greeva-black">Kebijakan Privasi</h1>
          <p className="mt-2 text-sm text-gray-400">Terakhir diperbarui: {LAST_UPDATED}</p>

          <div className="prose prose-sm mt-10 max-w-none text-gray-700">
            <h2>1. Data yang Kami Kumpulkan</h2>
            <p>
              Greeva mengumpulkan data berikut untuk menjalankan layanan platform:
            </p>
            <ul>
              <li>Nama lengkap dan alamat email saat registrasi</li>
              <li>Nomor telepon dan alamat pengiriman saat checkout</li>
              <li>Riwayat pesanan dan preferensi belanja</li>
              <li>Data teknis: IP address, jenis browser, halaman yang dikunjungi</li>
            </ul>

            <h2>2. Penggunaan Data</h2>
            <p>Data yang kami kumpulkan digunakan untuk:</p>
            <ul>
              <li>Memproses dan mengirimkan pesanan</li>
              <li>Mengirimkan notifikasi terkait pesanan via email dan WhatsApp</li>
              <li>Meningkatkan pengalaman berbelanja di platform</li>
              <li>Mencegah penipuan dan menjaga keamanan akun</li>
            </ul>

            <h2>3. Berbagi Data</h2>
            <p>
              Greeva tidak menjual data pribadi kamu ke pihak ketiga. Data alamat pengiriman
              diteruskan ke mitra logistik (JNE, J&T, dll.) hanya untuk keperluan pengiriman pesanan.
              Kami menggunakan Midtrans untuk pemrosesan pembayaran — data kartu tidak pernah melewati
              server Greeva.
            </p>

            <h2>4. Keamanan Data</h2>
            <p>
              Kami menggunakan enkripsi HTTPS untuk semua komunikasi data. Password disimpan
              dalam format hash yang tidak dapat dibaca. Token autentikasi memiliki masa berlaku
              dan dapat dicabut kapan saja.
            </p>

            <h2>5. Hak Kamu</h2>
            <p>Sebagai pengguna, kamu berhak untuk:</p>
            <ul>
              <li>Meminta salinan data pribadi yang kami miliki</li>
              <li>Meminta penghapusan akun dan data terkait</li>
              <li>Memperbarui informasi pribadi kapan saja melalui halaman akun</li>
              <li>Berhenti berlangganan email marketing</li>
            </ul>

            <h2>6. Cookie</h2>
            <p>
              Greeva menggunakan cookie untuk menjaga sesi login dan menyimpan preferensi keranjang
              belanja. Tidak ada cookie tracking pihak ketiga yang digunakan tanpa persetujuan.
            </p>

            <h2>7. Kontak</h2>
            <p>
              Untuk pertanyaan atau permintaan terkait privasi data, hubungi kami di{' '}
              <a href="mailto:privasi@greeva.id" className="text-greeva-starbucks-green hover:underline">
                privasi@greeva.id
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
