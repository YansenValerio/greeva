import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Masuk' };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-greeva-black">Selamat datang kembali</h1>
      <p className="mb-8 text-sm text-gray-600">Masuk untuk melanjutkan belanja.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
