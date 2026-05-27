'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  /** Jika diisi, pagination dikontrol via callback (mode client/local state). Jika tidak, sinkron ke URL query `page`. */
  onPageChange?: (page: number) => void;
  className?: string;
}

function buildRange(current: number, last: number): (number | 'dots')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const items: (number | 'dots')[] = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(last - 1, current + 1);

  items.push(1);
  if (left > 2) items.push('dots');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < last - 1) items.push('dots');
  items.push(last);

  return items;
}

export function Pagination({ currentPage, lastPage, onPageChange, className }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (lastPage <= 1) return null;

  function goTo(page: number) {
    if (page < 1 || page > lastPage || page === currentPage) return;

    if (onPageChange) {
      onPageChange(page);
      return;
    }

    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  const items = buildRange(currentPage, lastPage);
  const baseBtn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors';

  return (
    <nav
      aria-label="Navigasi halaman"
      className={`flex flex-wrap items-center justify-center gap-1.5 ${className ?? ''}`}
    >
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Halaman sebelumnya"
        className={`${baseBtn} border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        &lsaquo;
      </button>

      {items.map((item, idx) =>
        item === 'dots' ? (
          <span key={`dots-${idx}`} className="px-1 text-sm text-gray-400">
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => goTo(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            className={`${baseBtn} ${
              item === currentPage
                ? 'bg-greeva-forest text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= lastPage}
        aria-label="Halaman berikutnya"
        className={`${baseBtn} border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        &rsaquo;
      </button>
    </nav>
  );
}
