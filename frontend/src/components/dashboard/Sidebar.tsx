'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

interface SidebarProps {
  title: string;
  nav: NavItem[];
}

export function Sidebar({ title, nav }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full flex-shrink-0 lg:w-56">
      <p className="mb-3 hidden text-caption uppercase tracking-[0.08em] font-semibold text-greeva-starbucks-green lg:mb-4 lg:block">
        {title}
      </p>

      {/* Mobile: horizontal scrollable tabs */}
      <nav
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden"
        aria-label={title}
      >
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-pill px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-greeva-forest text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden flex-col gap-1 lg:flex" aria-label={title}>
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-greeva-mint-light text-greeva-forest-dark'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-greeva-black'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
