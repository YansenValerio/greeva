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
import { Price } from '@/components/shared/Price';
import { checkout } from '@/lib/api/orders';
import { getAddresses } from '@/lib/api/addresses';
import { getShippingRates, type ShippingRate } from '@/lib/api/shipping';
import { useCartStore } from '@/stores/cart.store';
import { checkoutSchema, type CheckoutFormData as FormData } from '@/lib/schemas/checkout';
import type { Address } from '@/types/address';

export function CheckoutForm() {
  const router = useRouter();
  const reset = useCartStore((s) => s.reset);
  const subtotal = useCartStore((s) => s.subtotal);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | 'manual' | null>(null);

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState('');
  const [selectedRateKey, setSelectedRateKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(checkoutSchema) });

  const postalCode = watch('shipping_postal_code');

  // Ambil opsi ongkir saat kode pos valid (5 digit). Reset pilihan saat kode pos berubah.
  useEffect(() => {
    setSelectedRateKey(null);
    setValue('shipping_courier', '', { shouldValidate: false });
    setValue('shipping_service', '', { shouldValidate: false });

    if (!postalCode || !/^\d{5}$/.test(postalCode)) {
      setRates([]);
      setRatesError('');
      return;
    }

    let cancelled = false;
    setRatesLoading(true);
    setRatesError('');

    getShippingRates(postalCode)
      .then((list) => {
        if (cancelled) return;
        setRates(list);
        if (list.length === 0) {
          setRatesError('Tidak ada opsi pengiriman untuk kode pos ini.');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setRates([]);
        setRatesError('Gagal memuat ongkir. Periksa kode pos atau coba lagi.');
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postalCode, setValue]);

  function selectRate(rate: ShippingRate) {
    const key = `${rate.courier_code}:${rate.service_code}`;
    setSelectedRateKey(key);
    setValue('shipping_courier', rate.courier_code, { shouldValidate: true });
    setValue('shipping_service', rate.service_code, { shouldValidate: true });
  }

  const selectedRate = rates.find(
    (r) => `${r.courier_code}:${r.service_code}` === selectedRateKey,
  );

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

      {/* Pengiriman */}
      <div>
        <h2 className="mb-4 text-h3 font-semibold text-greeva-black">Pengiriman</h2>

        <input type="hidden" {...register('shipping_courier')} />
        <input type="hidden" {...register('shipping_service')} />

        {!postalCode || !/^\d{5}$/.test(postalCode) ? (
          <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500">
            Isi kode pos yang valid untuk melihat opsi pengiriman.
          </p>
        ) : ratesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : ratesError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {ratesError}
          </p>
        ) : (
          <div className="space-y-2">
            {rates.map((rate) => {
              const key = `${rate.courier_code}:${rate.service_code}`;
              const active = key === selectedRateKey;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => selectRate(rate)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                    active
                      ? 'border-greeva-forest bg-greeva-mint-light/50 ring-1 ring-greeva-forest'
                      : 'border-gray-200 hover:border-greeva-forest/50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-greeva-black">
                      {rate.courier_name} — {rate.service_name}
                    </p>
                    <p className="text-xs text-gray-500">Estimasi {rate.etd}</p>
                  </div>
                  <Price cents={rate.cost} className="text-sm font-semibold text-greeva-forest-dark" />
                </button>
              );
            })}
          </div>
        )}

        {errors.shipping_courier && (
          <p className="mt-2 text-sm text-red-600">{errors.shipping_courier.message}</p>
        )}
      </div>

      {/* Ringkasan biaya */}
      <div className="rounded-card bg-greeva-sand-warm p-5">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Subtotal</dt>
            <dd className="font-medium text-greeva-text-body">
              <Price cents={subtotal} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Ongkos kirim</dt>
            <dd className="font-medium text-greeva-text-body">
              {selectedRate ? <Price cents={selectedRate.cost} /> : <span className="text-gray-400">Pilih kurir</span>}
            </dd>
          </div>
        </dl>
        <div className="my-3 border-t border-gray-200" />
        <div className="flex justify-between text-base font-bold">
          <span className="text-greeva-black">Total</span>
          <Price
            cents={subtotal + (selectedRate?.cost ?? 0)}
            className="text-greeva-forest-dark"
          />
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
