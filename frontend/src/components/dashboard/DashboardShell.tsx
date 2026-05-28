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
    <main className="py-6 md:py-10 lg:py-14">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <Sidebar title={sidebarTitle} nav={nav} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
