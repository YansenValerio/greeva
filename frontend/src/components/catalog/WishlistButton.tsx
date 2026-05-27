'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from '@/hooks/useHydrated';
import { toast } from '@/lib/feedback';

interface WishlistButtonProps {
  productId: number;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const inList = useWishlistStore((s) => s.ids.includes(productId));
  const toggle = useWishlistStore((s) => s.toggle);
  const [busy, setBusy] = useState(false);

  // Hindari mismatch hydration: status aktif hanya setelah hydrate
  const isActive = hydrated && inList;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (busy) return;
    setBusy(true);
    try {
      const added = await toggle(productId);
      toast.success(added ? 'Ditambahkan ke wishlist.' : 'Dihapus dari wishlist.');
    } catch {
      toast.error('Gagal memperbarui wishlist.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={isActive ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
      aria-pressed={isActive}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:opacity-60',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-[18px] w-[18px] transition-colors',
          isActive ? 'fill-red-500 text-red-500' : 'text-gray-500',
        )}
      />
    </button>
  );
}
