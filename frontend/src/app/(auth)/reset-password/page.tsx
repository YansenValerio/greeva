'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { FormField } from '@/components/shared/FormField';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { resetPassword } from '@/lib/api/auth';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const emailFromUrl = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Token reset tidak ditemukan di URL. Mohon klik tautan dari email lagi.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(res.message);
      setTimeout(() => router.push('/login'), 2500);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message as string | undefined) ?? 'Gagal reset password.'
        : 'Gagal reset password.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <>
        <h1 className="mb-2 text-2xl font-bold text-greeva-black">Tautan tidak valid</h1>
        <p className="mb-8 text-sm text-gray-600">
          Token reset tidak ditemukan. Silakan minta tautan baru.
        </p>
        <Link
          href="/forgot-password"
          className="block w-full rounded-pill bg-greeva-forest py-3 text-center text-base font-semibold text-white hover:bg-greeva-starbucks-green transition-colors"
        >
          Minta Tautan Reset
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-greeva-black">Buat password baru</h1>
      <p className="mb-8 text-sm text-gray-600">Pilih password baru untuk akun kamu.</p>

      {success && (
        <div className="mb-5 rounded-card bg-greeva-mint-light p-4 text-sm text-greeva-forest-dark">
          {success} Mengarahkan ke login...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="rounded-card bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <FormField label="Email" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </FormField>

        <FormField label="Password Baru" hint="Minimal 8 karakter" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </FormField>

        <FormField label="Konfirmasi Password Baru" required>
          <Input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Reset Password'}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded bg-gray-100" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
