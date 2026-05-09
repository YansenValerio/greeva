'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Price } from '@/components/shared/Price';
import { useCartStore } from '@/stores/cart.store';
import type { CartItem } from '@/types/cart';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateItem, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-5">
      {/* Gambar */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-greeva-mint-light">
        {item.product_image ? (
          <Image
            src={item.product_image}
            alt={item.product_name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[10px] text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-semibold leading-snug text-greeva-black">{item.product_name}</p>
        <p className="text-sm text-gray-500">{item.variant_name}</p>
        <Price cents={item.price} className="text-sm font-medium text-greeva-forest-dark" />
      </div>

      {/* Qty + hapus */}
      <div className="flex flex-col items-end justify-between gap-2">
        <button
          onClick={() => removeItem(item.variant_id)}
          aria-label="Hapus item"
          className="text-gray-400 transition-colors hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <div className="flex items-center overflow-hidden rounded-pill border border-gray-200 text-sm">
          <button
            onClick={() => updateItem(item.variant_id, item.quantity - 1)}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            disabled={item.quantity <= 1}
            aria-label="Kurangi"
          >
            −
          </button>
          <span className="w-6 select-none text-center">{item.quantity}</span>
          <button
            onClick={() => updateItem(item.variant_id, item.quantity + 1)}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
            aria-label="Tambah"
          >
            +
          </button>
        </div>

        <Price
          cents={item.price * item.quantity}
          className="text-sm font-semibold text-greeva-forest-dark"
        />
      </div>
    </div>
  );
}
