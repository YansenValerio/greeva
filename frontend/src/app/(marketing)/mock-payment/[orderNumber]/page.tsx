'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/shared/Container';
import { mockPay } from '@/lib/api/orders';
import { useCartStore } from '@/stores/cart.store';

export default function MockPaymentPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const reset = useCartStore((s) => s.reset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePay() {
    setLoading(true);
    setError('');
    try {
      await mockPay(orderNumber);
      reset();
      router.push(`/orders/${orderNumber}`);
    } catch {
      setError('Gagal memproses. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <main className="py-20">
      <Container>
        <div className="mx-auto max-w-md rounded-card border border-greeva-mint-light bg-white p-8 text-center shadow-sm">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-greeva-mint-light">
            <span className="text-3xl">🧪</span>
          </div>

          <h1 className="text-h2 font-bold text-greeva-black">Mode Demo</h1>
          <p className="mt-2 text-sm text-gray-500">
            Midtrans belum dikonfigurasi. Ini adalah halaman simulasi pembayaran untuk keperluan demo.
          </p>

          <div className="mt-6 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm text-gray-600">
            <span className="font-medium text-greeva-forest-dark">Nomor Order:</span>{' '}
            <span className="font-mono">{orderNumber}</span>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="mt-6 w-full rounded-pill bg-greeva-forest px-8 py-4 text-base font-semibold text-white transition-all hover:bg-greeva-starbucks-green disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Simulasi Bayar Sukses'}
          </button>

          <button
            onClick={() => router.push(`/orders/${orderNumber}`)}
            className="mt-3 w-full rounded-pill border border-gray-200 px-8 py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            Lihat Order (Bayar Nanti)
          </button>

          <p className="mt-6 text-xs text-gray-400">
            Halaman ini tidak muncul di production. Untuk mengaktifkan pembayaran nyata, tambahkan{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5">MIDTRANS_SERVER_KEY</code> ke{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5">.env</code>.
          </p>
        </div>
      </Container>
    </main>
  );
}
