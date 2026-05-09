'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FormField } from '@/components/shared/FormField';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { checkout } from '@/lib/api/orders';
import { useCartStore } from '@/stores/cart.store';

const schema = z.object({
  shipping_name: z.string().min(2, 'Nama penerima wajib diisi.').max(255),
  shipping_phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,20}$/, 'Nomor telepon tidak valid.'),
  shipping_address: z.string().min(10, 'Alamat terlalu pendek.').max(1000),
  shipping_province: z.string().min(1, 'Provinsi wajib diisi.'),
  shipping_city: z.string().min(1, 'Kota/Kabupaten wajib diisi.'),
  shipping_district: z.string().max(100).optional(),
  shipping_postal_code: z
    .string()
    .length(5, 'Kode pos harus 5 digit angka.')
    .regex(/^\d{5}$/, 'Kode pos harus berupa angka.'),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export function CheckoutForm() {
  const router = useRouter();
  const reset = useCartStore((s) => s.reset);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    try {
      const result = await checkout({
        ...values,
        shipping_district: values.shipping_district || undefined,
        notes: values.notes || undefined,
      });

      const { snap_token, data: order } = result;

      window.snap.pay(snap_token, {
        onSuccess: () => {
          reset();
          router.push(`/orders/${order.order_number}`);
        },
        onPending: () => {
          reset();
          router.push(`/orders/${order.order_number}`);
        },
        onError: () => {
          setError('root', { message: 'Pembayaran gagal. Silakan coba lagi.' });
        },
        onClose: () => {
          router.push(`/orders/${order.order_number}`);
        },
      });
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message as string | undefined) ?? 'Checkout gagal.'
        : 'Checkout gagal.';
      setError('root', { message: msg });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {errors.root && (
        <div className="rounded-card bg-red-50 p-4 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      <div>
        <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Alamat Pengiriman</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nama Penerima" error={errors.shipping_name?.message} required>
              <Input
                placeholder="Nama lengkap penerima"
                autoComplete="name"
                error={!!errors.shipping_name}
                {...register('shipping_name')}
              />
            </FormField>

            <FormField label="Nomor Telepon" error={errors.shipping_phone?.message} required>
              <Input
                type="tel"
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
                error={!!errors.shipping_phone}
                {...register('shipping_phone')}
              />
            </FormField>
          </div>

          <FormField label="Alamat Lengkap" error={errors.shipping_address?.message} required>
            <textarea
              rows={3}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
              className="w-full rounded-input border-[1.5px] border-gray-200 px-4 py-3 text-base transition-colors placeholder:text-gray-400 focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
              {...register('shipping_address')}
            />
            {errors.shipping_address && (
              <p className="text-sm text-red-600">{errors.shipping_address.message}</p>
            )}
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Provinsi" error={errors.shipping_province?.message} required>
              <Input
                placeholder="DKI Jakarta"
                error={!!errors.shipping_province}
                {...register('shipping_province')}
              />
            </FormField>

            <FormField label="Kota / Kabupaten" error={errors.shipping_city?.message} required>
              <Input
                placeholder="Jakarta Selatan"
                error={!!errors.shipping_city}
                {...register('shipping_city')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Kecamatan" error={errors.shipping_district?.message}>
              <Input
                placeholder="Kebayoran Baru (opsional)"
                error={!!errors.shipping_district}
                {...register('shipping_district')}
              />
            </FormField>

            <FormField
              label="Kode Pos"
              error={errors.shipping_postal_code?.message}
              required
              hint="5 digit"
            >
              <Input
                placeholder="12345"
                maxLength={5}
                error={!!errors.shipping_postal_code}
                {...register('shipping_postal_code')}
              />
            </FormField>
          </div>

          <FormField label="Catatan untuk Penjual" error={errors.notes?.message}>
            <textarea
              rows={2}
              placeholder="Instruksi khusus, warna pilihan, dll (opsional)"
              className="w-full rounded-input border-[1.5px] border-gray-200 px-4 py-3 text-base transition-colors placeholder:text-gray-400 focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
              {...register('notes')}
            />
          </FormField>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Pembayaran diproses dengan aman melalui Midtrans.
      </p>
    </form>
  );
}
