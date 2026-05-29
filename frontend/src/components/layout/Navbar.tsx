'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ShoppingBag, LogOut, User, Search, X, Menu } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useCartUiStore } from '@/stores/cart-ui.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useHydrated } from '@/hooks/useHydrated';
import { logout as logoutApi } from '@/lib/api/auth';
import { getGuestCartToken } from '@/lib/guestCart';
import { NotificationBell } from '@/components/layout/NotificationBell';

export function Navbar() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  }

  const { isAuthenticated, user, logout } = useAuthStore();
  const { count, reset: resetCart, fetch: fetchCart } = useCartStore();
  const openCart = useCartUiStore((s) => s.openCart);
  const fetchWishlist = useWishlistStore((s) => s.fetch);
  const resetWishlist = useWishlistStore((s) => s.reset);

  // Sync cart count saat hydrated — untuk auth user atau guest yang sudah punya token
  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated || getGuestCartToken()) {
      fetchCart();
    }
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [hydrated, isAuthenticated, fetchCart, fetchWishlist]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      /* token may be expired — proceed anyway */
    }
    logout();
    resetCart();
    resetWishlist();
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 text-white transition-all duration-300 ${
        scrolled ? 'bg-greeva-emerald shadow-sm' : 'bg-transparent'
      }`}
    >
      {/* Search overlay */}
      {searchOpen && (
        <div
          className="absolute inset-0 flex items-center bg-greeva-emerald px-4"
          role="search"
        >
          <Container className="flex w-full items-center gap-3">
            <Search className="h-5 w-5 flex-shrink-0 text-white/60" />
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, material, brand..."
                aria-label="Cari produk"
                className="w-full bg-transparent text-base text-white placeholder-white/50 focus:outline-none"
              />
            </form>
            <button
              onClick={() => setSearchOpen(false)}
              aria-label="Tutup pencarian"
              className="rounded-full p-1.5 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </Container>
        </div>
      )}
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
              href="/mitra"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Mitra
            </Link>
            <Link
              href="/cerita"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Cerita
            </Link>
            <Link
              href="/tentang"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Tentang
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Cari produk"
              className="text-white/80 hover:text-white transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifikasi */}
            <NotificationBell />

            {/* Cart */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Keranjang belanja${count > 0 ? ` (${count} item)` : ''}`}
              className="relative text-white/80 hover:text-white transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {hydrated && count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-greeva-leaf text-[10px] font-bold text-greeva-forest-dark">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Auth */}
            {hydrated ? (
              isAuthenticated ? (
                <div className="hidden items-center gap-3 md:flex">
                  <Link
                    href="/account"
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

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu"
              className="text-white/80 hover:text-white transition-colors md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu drawer */}
      <div
        className={`fixed inset-0 z-[200] md:hidden ${
          mobileMenuOpen ? '' : 'pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className={`absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-white text-greeva-black shadow-card-hover transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <span className="text-lg font-bold tracking-tight text-greeva-emerald">Greeva</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Tutup menu"
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3" aria-label="Navigasi utama">
            {[
              { href: '/shop', label: 'Toko' },
              { href: '/mitra', label: 'Mitra' },
              { href: '/cerita', label: 'Cerita' },
              { href: '/tentang', label: 'Tentang' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-5 py-3 text-base font-medium text-greeva-black hover:bg-greeva-mint-light/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-100 px-5 py-4">
            {hydrated && isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-greeva-mint-light/40 px-4 py-3 text-sm font-medium text-greeva-forest-dark"
                >
                  <User className="h-4 w-4" />
                  <span className="truncate">{user?.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-pill bg-greeva-forest py-3 text-center text-sm font-semibold text-white hover:bg-greeva-starbucks-green"
              >
                Masuk
              </Link>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
