'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';

const QUICK_LINKS = [
  { label: 'Kelola Produk', href: '/admin/products', desc: 'Review & aktifkan produk mitra' },
  { label: 'Kelola Pesanan', href: '/admin/orders', desc: 'Update status & pengiriman' },
  { label: 'Kelola Mitra', href: '/admin/partners', desc: 'Daftar & data mitra aktif' },
  { label: 'Kelola Payout', href: '/admin/payouts', desc: 'Generate & proses pembayaran mitra' },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader title="Admin Greeva" description="Selamat datang di panel admin." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-card bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <p className="font-semibold text-greeva-black">{link.label}</p>
            <p className="mt-1 text-sm text-gray-500">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
