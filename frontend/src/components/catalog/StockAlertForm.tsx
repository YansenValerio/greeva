'use client';

import { useState } from 'react';
import axios from 'axios';
import { subscribeStockAlert } from '@/lib/api/stockAlerts';
import { toast } from '@/lib/feedback';
import { useAuthStore } from '@/stores/auth.store';

export function StockAlertForm({ variantId }: { variantId: number }) {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    try {
      await subscribeStockAlert({
        product_variant_id: variantId,
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      setDone(true);
      toast.success('Siap! Kami kabari via WhatsApp saat tersedia.');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message as string | undefined) ?? 'Gagal mendaftar notifikasi.'
        : 'Gagal mendaftar notifikasi.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-lg bg-greeva-mint-light px-4 py-3 text-sm text-greeva-forest-dark">
        ✓ Kami akan mengabari via WhatsApp saat produk tersedia kembali.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-pill border-[1.5px] border-greeva-forest-dark px-6 py-3 text-sm font-semibold text-greeva-forest-dark transition-colors hover:bg-greeva-mint-light"
      >
        Beritahu saya saat tersedia
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-card border border-gray-200 p-4">
      <p className="text-sm font-medium text-greeva-black">
        Beritahu saya saat stok tersedia
      </p>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Nomor WhatsApp"
        required
        className="w-full rounded-lg border-[1.5px] border-gray-200 px-4 py-2.5 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (opsional)"
        className="w-full rounded-lg border-[1.5px] border-gray-200 px-4 py-2.5 text-sm focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-pill bg-greeva-forest px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-greeva-starbucks-green disabled:opacity-50"
      >
        {loading ? 'Mendaftarkan...' : 'Daftarkan'}
      </button>
    </form>
  );
}
