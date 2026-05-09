import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Daftar' };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-greeva-black">Buat akun baru</h1>
      <p className="mb-8 text-sm text-gray-600">
        Bergabung dan dukung brand hijau lokal Indonesia.
      </p>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </>
  );
}
