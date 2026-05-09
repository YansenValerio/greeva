'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCategories } from '@/lib/api/categories';
import { generateProductCopy } from '@/lib/api/ai';
import type { Category } from '@/types/category';

const schema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(1, 'Harga wajib diisi'), // rupiah di form, konversi ke sen saat submit
  compare_price: z.coerce.number().optional().nullable(),
  category_id: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  weight: z.coerce.number().min(1, 'Berat wajib diisi'),
  material: z.string().optional(),
  sustainability_notes: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof schema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel?: string;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Simpan',
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    getCategories().then((res) => setCategories(res)).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
    },
  });

  const productName = watch('name');

  async function handleGenerateCopy() {
    const name = getValues('name');
    if (!name.trim()) {
      setAiError('Isi nama produk dulu sebelum generate.');
      return;
    }
    setAiError('');
    setGenerating(true);
    try {
      const copy = await generateProductCopy({
        name,
        material: getValues('material') || undefined,
        short_description: getValues('short_description') || undefined,
      });

      if (copy.description) setValue('description', copy.description);
      if (copy.short_description) setValue('short_description', copy.short_description);
      if (copy.sustainability_notes) setValue('sustainability_notes', copy.sustainability_notes);
    } catch {
      setAiError('Gagal generate copy. Pastikan API key terkonfigurasi.');
    } finally {
      setGenerating(false);
    }
  }

  async function onValid(values: ProductFormValues) {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.';
      setError('root', { message: msg });
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6 max-w-2xl">
      {errors.root && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-greeva-black">
          Nama Produk <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
          placeholder="Gelang Manik HDPE"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-greeva-black">
            Harga (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('price')}
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
            placeholder="85000"
          />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-greeva-black">
            Harga Coret (Rp)
          </label>
          <input
            {...register('compare_price')}
            type="number"
            min={0}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
            placeholder="100000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-greeva-black">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            {...register('category_id')}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-xs text-red-600">{errors.category_id.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-greeva-black">
            Berat (gram) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('weight')}
            type="number"
            min={1}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
            placeholder="50"
          />
          {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-greeva-black">Material</label>
        <input
          {...register('material')}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
          placeholder="Plastik HDPE daur ulang"
        />
      </div>

      {/* AI Generate section */}
      <div className="rounded-card border border-greeva-mint-light bg-greeva-mint-light/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-greeva-forest-dark">Generate Copy dengan AI</p>
            <p className="mt-0.5 text-xs text-greeva-forest-dark/70">
              Isi nama produk + material di atas, lalu klik generate. Hasil bisa diedit sebelum disimpan.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateCopy}
            disabled={generating || !productName?.trim()}
            className="flex-shrink-0 rounded-pill border border-greeva-forest bg-white px-4 py-2 text-xs font-semibold text-greeva-forest transition-colors hover:bg-greeva-mint-light disabled:opacity-40"
          >
            {generating ? 'Generating...' : '✦ Generate'}
          </button>
        </div>
        {aiError && <p className="mt-2 text-xs text-red-600">{aiError}</p>}
        {generating && (
          <div className="mt-3 flex items-center gap-2 text-xs text-greeva-forest-dark/60">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-greeva-forest border-t-transparent" />
            AI sedang menulis copy untuk produkmu…
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-greeva-black">
          Deskripsi Singkat
        </label>
        <input
          {...register('short_description')}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
          placeholder="Aksesoris dari plastik HDPE daur ulang"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-greeva-black">Deskripsi</label>
        <textarea
          {...register('description')}
          rows={6}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
          placeholder="Deskripsi lengkap produk..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-greeva-black">
          Catatan Keberlanjutan
        </label>
        <textarea
          {...register('sustainability_notes')}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
          placeholder="Dibuat dari 100% plastik HDPE daur ulang..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-pill bg-greeva-forest px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-greeva-starbucks-green disabled:opacity-50"
      >
        {isSubmitting ? 'Menyimpan...' : submitLabel}
      </button>
    </form>
  );
}
