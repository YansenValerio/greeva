'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FormField } from '@/components/shared/FormField';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';

const schema = z.object({
  email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const authLogin = useAuthStore((s) => s.login);
  const fetchCart = useCartStore((s) => s.fetch);
  const mergeCart = useCartStore((s) => s.mergeAfterLogin);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    try {
      const res = await login(values);
      authLogin(res.data, res.token);
      // Merge guest cart kalau ada, lalu fallback fetch auth cart
      await mergeCart();
      await fetchCart();
      const role = res.data.role;
      const destination =
        role === 'admin' ? '/admin/dashboard' :
        role === 'partner' ? '/partner/dashboard' :
        next;
      router.push(destination);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message as string | undefined) ?? 'Login gagal.'
        : 'Login gagal.';
      setError('root', { message: msg });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {errors.root && (
        <div className="rounded-card bg-red-50 p-4 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="kamu@email.com"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField label="Kata Sandi" error={errors.password?.message} required>
        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-greeva-starbucks-green hover:underline"
        >
          Lupa kata sandi?
        </Link>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Masuk'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Belum punya akun?{' '}
        <Link
          href={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="font-medium text-greeva-starbucks-green hover:underline"
        >
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}
