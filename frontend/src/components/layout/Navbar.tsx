'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, User } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useHydrated } from '@/hooks/useHydrated';
import { logout as logoutApi } from '@/lib/api/auth';

export function Navbar() {
  const router = useRouter();
  const hydrated = useHydrated();

  const { isAuthenticated, user, logout } = useAuthStore();
  const { count, reset: resetCart } = useCartStore();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      /* token may be expired — proceed anyway */
    }
    logout();
    resetCart();
    router.push('/');
  };

  return (
    <header className="bg-greeva-emerald text-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            Greeva
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
            <Link
              href="/shop"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Toko
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Tentang Kami
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Keranjang belanja${count > 0 ? ` (${count} item)` : ''}`}
              className="relative text-white/80 hover:text-white transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {hydrated && count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-greeva-leaf text-[10px] font-bold text-greeva-forest-dark">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {hydrated ? (
              isAuthenticated ? (
                <div className="hidden items-center gap-3 md:flex">
                  <Link
                    href="/orders"
                    className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
                    aria-label={`Akun ${user?.name}`}
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    aria-label="Keluar"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden rounded-pill border border-white/40 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors md:inline-flex"
                >
                  Masuk
                </Link>
              )
            ) : (
              <div className="hidden h-8 w-16 animate-pulse rounded-pill bg-white/20 md:block" />
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
