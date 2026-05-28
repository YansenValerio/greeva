'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductImageLightbox } from './ProductImageLightbox';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const SWIPE_THRESHOLD = 50;

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-card bg-greeva-mint-light">
        <span className="text-caption uppercase tracking-widest text-greeva-forest-dark/30">
          Foto belum tersedia
        </span>
      </div>
    );
  }

  function next() {
    setActiveIndex((i) => (i + 1) % images.length);
  }
  function prev() {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }

  function onPointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) next();
      else prev();
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-label={`Perbesar foto ${productName}`}
        className="group relative block aspect-square w-full overflow-hidden rounded-card bg-greeva-mint-light"
      >
        <Image
          src={images[activeIndex]}
          alt={`${productName} — foto ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
          draggable={false}
        />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-pill bg-black/40 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" />
          Perbesar
        </span>
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-pill bg-black/40 px-2.5 py-1 text-xs font-medium text-white">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Lihat foto ${i + 1}`}
              className={cn(
                'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                i === activeIndex
                  ? 'border-greeva-forest opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <ProductImageLightbox
        images={images}
        productName={productName}
        initialIndex={activeIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
