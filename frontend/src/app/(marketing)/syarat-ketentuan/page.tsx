import type { Metadata } from 'next';
import { Container } from '@/components/shared/Container';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan platform Greeva.',
};

const LAST_UPDATED = '1 Mei 2026';

export default function SyaratKetentuanPage() {
  return (
    <main className="pb-24 pt-16">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-h1 font-bold text-greeva-black">Syarat & Ketentuan</h1>
          <p className="mt-2 text-sm text-gray-400">Terakhir diperbarui: {LAST_UPDATED}</p>

          <div className="prose prose-sm mt-10 max-w-none text-gray-700">
            <h2>1. Tentang Greeva</h2>
            <p>
              Greeva adalah platform konsinyasi digital yang menjual produk brand hijau lokal
              Indonesia. Produk yang tersedia di Greeva adalah milik mitra brand dan dijual atas
              nama Greeva sebagai operator platform.
            </p>

            <h2>2. Akun Pengguna</h2>
            <p>
              Pengguna bertanggung jawab atas keamanan kredensial akun mereka. Greeva tidak
              bertanggung jawab atas kerugian akibat akses tidak sah yang disebabkan kelalaian
              pengguna. Satu orang hanya boleh memiliki satu akun aktif.
            </p>

            <h2>3. Pembelian & Pembayaran</h2>
            <ul>
              <li>Semua harga dalam Rupiah dan sudah termasuk PPN jika berlaku</li>
              <li>Pembayaran diproses melalui Midtrans (transfer bank, kartu kredit, e-wallet)</li>
              <li>Pesanan terkonfirmasi setelah pembayaran berhasil diverifikasi</li>
              <li>Batas waktu pembayaran adalah 24 jam setelah order dibuat</li>
            </ul>

            <h2>4. Pengiriman</h2>
            <p>
              Greeva menggunakan jasa kurir pihak ketiga. Estimasi pengiriman bersifat indikatif
              dan dapat berubah karena faktor di luar kendali Greeva. Greeva tidak bertanggung jawab
              atas keterlambatan yang disebabkan oleh kurir atau kondisi force majeure.
            </p>

            <h2>5. Retur & Refund</h2>
            <p>
              Pengembalian produk dapat diajukan dalam 3 hari kerja setelah pesanan diterima,
              dengan kondisi produk belum digunakan dan dalam kemasan asli. Refund diproses dalam
              3–7 hari kerja setelah retur diterima dan diverifikasi.
            </p>

            <h2>6. Ulasan Produk</h2>
            <p>
              Pengguna dapat memberikan ulasan jujur atas produk yang telah dibeli. Greeva berhak
              menghapus ulasan yang mengandung konten tidak pantas, spam, atau tidak relevan dengan
              produk tanpa pemberitahuan sebelumnya.
            </p>

            <h2>7. Larangan</h2>
            <p>Pengguna dilarang untuk:</p>
            <ul>
              <li>Melakukan pembelian palsu atau penipuan</li>
              <li>Menggunakan platform untuk kepentingan komersial tanpa izin</li>
              <li>Menyebarkan konten yang melanggar hukum atau hak pihak lain</li>
              <li>Mencoba meretas atau mengeksploitasi kelemahan sistem</li>
            </ul>

            <h2>8. Perubahan Syarat</h2>
            <p>
              Greeva berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan
              diumumkan melalui email atau notifikasi di platform setidaknya 7 hari sebelum berlaku.
            </p>

            <h2>9. Kontak</h2>
            <p>
              Pertanyaan terkait syarat dan ketentuan dapat dikirimkan ke{' '}
              <a href="mailto:halo@greeva.id" className="text-greeva-starbucks-green hover:underline">
                halo@greeva.id
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
