'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FormField } from '@/components/shared/FormField';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { checkout } from '@/lib/api/orders';
import { getAddresses } from '@/lib/api/addresses';
import { useCartStore } from '@/stores/cart.store';
import { checkoutSchema, type CheckoutFormData as FormData } from '@/lib/schemas/checkout';
import type { Address } from '@/types/address';

export function CheckoutForm() {
  const router = useRouter();
  const reset = useCartStore((s) => s.reset);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | 'manual' | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(checkoutSchema) });

  // Load alamat tersimpan + auto-pilih default
  useEffect(() => {
    getAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.is_default) ?? list[0];
        if (def) {
          setSelectedId(def.id);
          applyAddress(def);
        } else {
          setSelectedId('manual');
        }
      })
      .catch(() => {
        setSelectedId('manual');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAddress(a: Address) {
    setValue('shipping_name', a.recipient_name, { shouldValidate: true });
    setValue('shipping_phone', a.phone, { shouldValidate: true });
    setValue('shipping_address', a.address, { shouldValidate: true });
    setValue('shipping_province', a.province, { shouldValidate: true });
    setValue('shipping_city', a.city, { shouldValidate: true });
    setValue('shipping_district', a.district ?? '', { shouldValidate: true });
    setValue('shipping_postal_code', a.postal_code, { shouldValidate: true });
  }

  function handleSelect(value: string) {
    if (value === 'manual') {
      setSelectedId('manual');
      return;
    }
    const id = Number(value);
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setSelectedId(id);
      applyAddress(addr);
    }
  }

  const onSubmit = async (values: FormData) => {
    try {
      const result = await checkout({
        ...values,
        shipping_district: values.shipping_district || undefined,
        notes: values.notes || undefined,
      });

      const { snap_token, data: order } = result;

      if (snap_token.startsWith('GREEVA_MOCK_')) {
        reset();
        router.push(`/mock-payment/${order.order_number}`);
        return;
      }

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
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-h3 font-semibold text-greeva-black">Alamat Pengiriman</h2>
          <Link
            href="/account/addresses"
            className="text-xs text-greeva-starbucks-green hover:underline"
          >
            Kelola alamat tersimpan →
          </Link>
        </div>

        {/* Saved address selector */}
        {addresses.length > 0 && (
          <div className="mb-5 rounded-lg border border-greeva-mint bg-greeva-mint-light/30 p-4">
            <label className="mb-2 block text-sm font-medium text-greeva-forest-dark">
              Pilih dari alamat tersimpan
            </label>
            <select
              value={selectedId ?? ''}
              onChange={(e) => handleSelect(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
            >
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label ? `[${a.label}] ` : ''}
                  {a.recipient_name} — {a.city}
                  {a.is_default ? ' (default)' : ''}
                </option>
              ))}
              <option value="manual">— Pakai alamat baru —</option>
            </select>
          </div>
        )}

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
