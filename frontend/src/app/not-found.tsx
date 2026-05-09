import Link from 'next/link';
import { Container } from '@/components/shared/Container';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <p className="text-[6rem] font-bold leading-none text-greeva-mint-light">404</p>
          <h1 className="mt-2 text-h1 font-bold text-greeva-black">Halaman tidak ditemukan.</h1>
          <p className="mt-4 text-base text-gray-600">
            Halaman yang kamu cari tidak ada atau sudah dipindahkan.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-pill bg-greeva-forest px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-greeva-starbucks-green hover:scale-[1.02]"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
