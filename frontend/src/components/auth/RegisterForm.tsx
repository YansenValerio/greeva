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
import { register as registerApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';

const schema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter.').max(255),
    email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{8,20}$/, 'Format nomor telepon tidak valid.')
      .optional()
      .or(z.literal('')),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter.'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const authLogin = useAuthStore((s) => s.login);
  const mergeCart = useCartStore((s) => s.mergeAfterLogin);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        ...(values.phone ? { phone: values.phone } : {}),
      };
      const res = await registerApi(payload);
      authLogin(res.data, res.token);
      await mergeCart();
      router.push(next);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message as string | undefined) ?? 'Registrasi gagal.'
        : 'Registrasi gagal.';
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

      <FormField label="Nama Lengkap" error={errors.name?.message} required>
        <Input placeholder="Nama kamu" autoComplete="name" error={!!errors.name} {...register('name')} />
      </FormField>

      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="kamu@email.com"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField label="Nomor Telepon" error={errors.phone?.message} hint="Opsional, untuk notifikasi WhatsApp">
        <Input
          type="tel"
          placeholder="08xxxxxxxxxx"
          autoComplete="tel"
          error={!!errors.phone}
          {...register('phone')}
        />
      </FormField>

      <FormField label="Kata Sandi" error={errors.password?.message} required>
        <Input
          type="password"
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          error={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <FormField label="Konfirmasi Kata Sandi" error={errors.password_confirmation?.message} required>
        <Input
          type="password"
          placeholder="Ulangi kata sandi"
          autoComplete="new-password"
          error={!!errors.password_confirmation}
          {...register('password_confirmation')}
        />
      </FormField>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Mendaftar...' : 'Daftar'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Sudah punya akun?{' '}
        <Link
          href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="font-medium text-greeva-starbucks-green hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
