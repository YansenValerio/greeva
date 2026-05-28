'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductImageLightboxProps {
  images: string[];
  productName: string;
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

export function ProductImageLightbox({
  images,
  productName,
  initialIndex,
  open,
  onClose,
}: ProductImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function next() {
    setIndex((i) => (i + 1) % images.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
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

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeri foto ${productName}`}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup galeri"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-pill bg-white/10 px-3 py-1 text-xs font-medium text-white">
          {index + 1} / {images.length}
        </div>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Foto sebelumnya"
          className="absolute left-2 z-10 hidden rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:left-6 md:block"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}

      {/* Image area (swipe-enabled) */}
      <div
        className="relative flex h-full w-full max-w-5xl items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="relative aspect-square w-full max-h-[85vh] select-none">
          <Image
            src={images[index]}
            alt={`${productName} — foto ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-contain"
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Foto berikutnya"
          className="absolute right-2 z-10 hidden rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:right-6 md:block"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}

      {/* Mobile dots / thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              aria-label={`Foto ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
