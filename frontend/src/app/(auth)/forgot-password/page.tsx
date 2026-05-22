'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FormField } from '@/components/shared/FormField';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { forgotPassword } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email wajib diisi.');
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await forgotPassword(email.trim());
      setMessage(res.message);
      setEmail('');
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message as string | undefined) ?? 'Gagal mengirim email reset.'
        : 'Gagal mengirim email reset.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-greeva-black">Lupa kata sandi?</h1>
      <p className="mb-8 text-sm text-gray-600">
        Masukkan email kamu, kami akan kirim tautan reset.
      </p>

      {message && (
        <div className="mb-5 rounded-card bg-greeva-mint-light p-4 text-sm text-greeva-forest-dark">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="rounded-card bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <FormField label="Email" required>
          <Input
            type="email"
            placeholder="kamu@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Mengirim...' : 'Kirim Tautan Reset'}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Ingat passwordnya?{' '}
          <Link href="/login" className="font-medium text-greeva-starbucks-green hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </>
  );
}
