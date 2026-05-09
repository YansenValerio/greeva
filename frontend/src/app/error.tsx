'use client';

import { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { Container } from '@/components/shared/Container';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <p className="text-caption uppercase tracking-[0.08em] text-greeva-starbucks-green">
            Terjadi Kesalahan
          </p>
          <h1 className="mt-3 text-h1 font-bold text-greeva-black">Aduh, ada yang error.</h1>
          <p className="mt-4 text-base text-gray-600">
            Sesuatu tidak berjalan semestinya. Coba lagi atau kembali ke halaman utama.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset}>Coba Lagi</Button>
            <Button variant="secondary" onClick={() => (window.location.href = '/')}>
              Ke Halaman Utama
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
