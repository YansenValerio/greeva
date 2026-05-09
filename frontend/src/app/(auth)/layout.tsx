import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-greeva-sand-warm">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 block text-center text-2xl font-bold text-greeva-forest-dark hover:opacity-80 transition-opacity"
          >
            Greeva
          </Link>
          <div className="rounded-card bg-white p-8 shadow-card">{children}</div>
        </div>
      </div>
    </div>
  );
}
