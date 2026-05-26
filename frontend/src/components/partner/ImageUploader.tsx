'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Plus, X, Loader2, ImageIcon } from 'lucide-react';
import { uploadImage } from '@/lib/api/upload';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUploader({ value, onChange, max = 5 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const remaining = max - value.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const urls = await Promise.all(toUpload.map((f) => uploadImage(f, 'products')));
      onChange([...value, ...urls]);
    } catch {
      setError('Gagal mengupload. Pastikan format JPEG/PNG/WebP, maks 5MB.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Existing images */}
        {value.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="96px" />
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-greeva-forest/80 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wider text-white">
                Utama
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-500"
              aria-label="Hapus foto"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-greeva-forest hover:bg-greeva-mint-light/30 hover:text-greeva-forest disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="text-[10px] font-medium">Tambah</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Empty state */}
      {value.length === 0 && !uploading && (
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-10 text-gray-400 transition-colors hover:border-greeva-forest hover:text-greeva-forest"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <ImageIcon className="h-8 w-8" />
          <div className="text-center">
            <p className="text-sm font-medium">Klik atau seret foto ke sini</p>
            <p className="text-xs text-gray-400">JPEG, PNG, WebP · Maks 5MB · Maks {max} foto</p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <p className="text-xs text-gray-400">
        Foto pertama akan menjadi foto utama produk. Urutan bisa diubah dengan menghapus dan mengupload ulang.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
