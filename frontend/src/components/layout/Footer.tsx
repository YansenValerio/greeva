import Link from 'next/link';
import { Container } from '@/components/shared/Container';

export function Footer() {
  return (
    <footer className="bg-greeva-forest-dark text-white/70">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="text-xl font-bold text-white tracking-tight">Greeva</p>
            <p className="mt-3 text-sm leading-relaxed max-w-xs">
              Ekosistem kurasi brand hijau lokal Indonesia. Setiap produk mendukung mitra
              brand yang berkomitmen pada keberlanjutan.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-caption tracking-[0.08em] uppercase text-greeva-leaf mb-4">
              Jelajahi
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Toko
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-caption tracking-[0.08em] uppercase text-greeva-leaf mb-4">
              Legal
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs">
          &copy; {new Date().getFullYear()} Greeva. Semua hak dilindungi.
        </div>
      </Container>
    </footer>
  );
}
