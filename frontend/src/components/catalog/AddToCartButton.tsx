'use client';

import { useState } from 'react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import type { ProductVariant } from '@/types/product';

interface AddToCartButtonProps {
  variants: ProductVariant[];
  defaultPrice: number; // sen
  totalStock: number;
}

export function AddToCartButton({ variants, defaultPrice, totalStock }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  const activeVariants = variants.filter((v) => v.is_active);
  const [selected, setSelected] = useState<ProductVariant | null>(activeVariants[0] ?? null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const outOfStock = totalStock === 0 || (selected !== null && selected.stock === 0);
  const effectivePrice = selected?.price ?? defaultPrice;

  const handleAdd = async () => {
    if (!selected) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addItem(selected.id, qty);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      const msg =
        axios.isAxiosError(e)
          ? (e.response?.data?.message as string | undefined) ?? 'Gagal menambah ke keranjang.'
          : 'Gagal menambah ke keranjang.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Variant selector */}
      {activeVariants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeVariants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v)}
              className={cn(
                'rounded-pill border px-4 py-2 text-sm font-medium transition-colors',
                selected?.id === v.id
                  ? 'border-greeva-forest bg-greeva-forest text-white'
                  : 'border-gray-200 text-gray-700 hover:border-greeva-forest',
                v.stock === 0 && 'opacity-50',
              )}
            >
              {v.name}
              {v.stock === 0 && <span className="ml-1 text-xs">(habis)</span>}
            </button>
          ))}
        </div>
      )}

      {/* Qty + Add button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-pill border border-gray-200">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-3 text-lg leading-none text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Kurangi jumlah"
          >
            −
          </button>
          <span className="w-8 select-none text-center text-base font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-3 text-lg leading-none text-gray-600 transition-colors hover:bg-gray-50"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock || loading}
          className={cn(
            'flex-1 inline-flex items-center justify-center rounded-pill px-8 py-4 text-base font-semibold transition-all',
            'disabled:cursor-not-allowed disabled:opacity-50',
            success
              ? 'bg-green-500 text-white'
              : 'bg-greeva-forest text-white hover:bg-greeva-starbucks-green hover:scale-[1.01]',
          )}
        >
          {loading
            ? 'Menambahkan...'
            : success
              ? '✓ Ditambahkan!'
              : outOfStock
                ? 'Stok Habis'
                : 'Tambah ke Keranjang'}
        </button>
      </div>

      {effectivePrice > 0 && activeVariants.length > 1 && selected && selected.price && (
        <p className="text-xs text-gray-500">
          Harga varian:{' '}
          <span className="font-medium text-greeva-forest-dark">
            Rp {(effectivePrice / 100).toLocaleString('id-ID')}
          </span>
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
