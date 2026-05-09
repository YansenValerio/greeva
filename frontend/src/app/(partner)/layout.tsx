'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

const PARTNER_NAV = [
  { label: 'Dashboard', href: '/partner/dashboard' },
  { label: 'Produk Saya', href: '/partner/products' },
  { label: 'Pendapatan', href: '/partner/earnings' },
  { label: 'Riwayat Payout', href: '/partner/payouts' },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRoleGuard('partner');

  if (!ready) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-greeva-mint-light border-t-greeva-forest" />
      </main>
    );
  }

  return (
    <DashboardShell sidebarTitle="Mitra" nav={PARTNER_NAV}>
      {children}
    </DashboardShell>
  );
}
