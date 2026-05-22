'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync value when URL param changes (e.g. browser back/forward)
  useEffect(() => {
    setValue(searchParams.get('search') ?? '');
  }, [searchParams]);

  function submit(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) {
      params.set('search', q.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(value);
  }

  function handleClear() {
    setValue('');
    submit('');
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full max-w-xl">
      <div className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm transition-shadow focus-within:border-greeva-forest focus-within:shadow-md">
        <Search className="ml-4 h-4 w-4 flex-shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari produk, material, brand..."
          aria-label="Cari produk"
          className="flex-1 bg-transparent py-3 pl-3 pr-2 text-sm text-greeva-black placeholder-gray-400 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Hapus pencarian"
            className="mr-1 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="mr-1.5 rounded-full bg-greeva-forest px-4 py-1.5 text-xs font-semibold text-white hover:bg-greeva-starbucks-green transition-colors"
        >
          Cari
        </button>
      </div>
    </form>
  );
}
