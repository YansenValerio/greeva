import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Instagram, Youtube } from 'lucide-react';
import { NewsletterForm } from '@/components/home/NewsletterForm';

const navColumns = [
  {
    title: 'Produk',
    links: [
      { label: 'Semua Produk', href: '/shop' },
      { label: 'Aksesoris', href: '/shop?category=aksesoris' },
      { label: 'Tas & Pouch', href: '/shop?category=tas-pouch' },
      { label: 'Home Living', href: '/shop?category=home-living' },
    ],
  },
  {
    title: 'Mitra',
    links: [
      { label: 'Notic', href: '/shop?partner=notic' },
      { label: 'Reperca', href: '/shop?partner=reperca' },
      { label: 'Daftar sebagai Mitra', href: '/partner/daftar' },
    ],
  },
  {
    title: 'Tentang',
    links: [
      { label: 'Cerita Kami', href: '/about' },
      { label: 'Misi & Dampak', href: '/about#misi' },
      { label: 'Kebijakan Privasi', href: '/privacy' },
      { label: 'Syarat & Ketentuan', href: '/terms' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Hubungi Kami', href: '/kontak' },
      { label: 'WhatsApp', href: 'https://wa.me/6281234567890' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <Container>
        {/* Top — brand + nav columns */}
        <div className="grid grid-cols-2 gap-10 pt-16 pb-12 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <p className="text-2xl font-bold tracking-tight text-greeva-black">Greeva</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-greeva-text-body/60">
              Sustainable brands deserve better marketing.
            </p>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-greeva-forest-dark/60">
                Berlangganan Update
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-greeva-forest-dark/60">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-greeva-text-body/70 transition-colors hover:text-greeva-starbucks-green"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 py-6 sm:flex-row">
          <p className="text-xs text-greeva-text-body/50">
            &copy; {new Date().getFullYear()} Greeva. Semua hak dilindungi.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            <Link
              href="https://instagram.com/greeva.id"
              aria-label="Instagram Greeva"
              className="text-greeva-text-body/40 transition-colors hover:text-greeva-starbucks-green"
            >
              <Instagram className="h-4 w-4" />
            </Link>
            <Link
              href="https://youtube.com/@greeva"
              aria-label="YouTube Greeva"
              className="text-greeva-text-body/40 transition-colors hover:text-greeva-starbucks-green"
            >
              <Youtube className="h-4 w-4" />
            </Link>
            <Link
              href="https://tiktok.com/@greeva.id"
              aria-label="TikTok Greeva"
              className="text-[11px] font-bold text-greeva-text-body/40 transition-colors hover:text-greeva-starbucks-green"
            >
              TikTok
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
