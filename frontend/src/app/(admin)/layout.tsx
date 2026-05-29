'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Produk', href: '/admin/products' },
  { label: 'Kategori', href: '/admin/categories' },
  { label: 'Voucher', href: '/admin/vouchers' },
  { label: 'Pesanan', href: '/admin/orders' },
  { label: 'Retur', href: '/admin/returns' },
  { label: 'Mitra', href: '/admin/partners' },
  { label: 'Earning', href: '/admin/earnings' },
  { label: 'Payout', href: '/admin/payouts' },
  { label: 'Pengguna', href: '/admin/users' },
  { label: 'Laporan', href: '/admin/reports' },
  { label: 'Audit Log', href: '/admin/audit-logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRoleGuard('admin');

  if (!ready) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-greeva-mint-light border-t-greeva-forest" />
      </main>
    );
  }

  return (
    <DashboardShell sidebarTitle="Admin" nav={ADMIN_NAV}>
      {children}
    </DashboardShell>
  );
}
