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
    <aside className="w-full lg:w-56 flex-shrink-0">
      <p className="mb-4 text-caption uppercase tracking-[0.08em] text-greeva-starbucks-green font-semibold">
        {title}
      </p>
      <nav className="flex flex-col gap-1">
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
