import { Sidebar } from './Sidebar';

interface NavItem {
  label: string;
  href: string;
}

interface DashboardShellProps {
  sidebarTitle: string;
  nav: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({ sidebarTitle, nav, children }: DashboardShellProps) {
  return (
    <main className="py-10 md:py-14">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <Sidebar title={sidebarTitle} nav={nav} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
