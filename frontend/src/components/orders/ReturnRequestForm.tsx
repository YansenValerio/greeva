'use client';

import { useState } from 'react';
import { createReturnRequest } from '@/lib/api/returns';
import { RETURN_REASON_LABELS, type ReturnReason, type ReturnRequest } from '@/types/return';

interface ReturnRequestFormProps {
  orderNumber: string;
  onSuccess: (ret: ReturnRequest) => void;
  onCancel: () => void;
}

const REASONS = Object.entries(RETURN_REASON_LABELS) as [ReturnReason, string][];

export function ReturnRequestForm({ orderNumber, onSuccess, onCancel }: ReturnRequestFormProps) {
  const [reason, setReason] = useState<ReturnReason>('damaged');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError('Penjelasan minimal 10 karakter.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const ret = await createReturnRequest(orderNumber, {
        reason,
        description: description.trim(),
      });
      onSuccess(ret);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Gagal mengajukan retur.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
      <p className="text-sm font-semibold text-amber-900">Ajukan Retur Pesanan</p>

      <div>
        <label className="mb-1 block text-xs font-medium text-greeva-black">Alasan retur</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as ReturnReason)}
          disabled={saving}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none disabled:opacity-50"
        >
          {REASONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-greeva-black">
          Jelaskan kondisi/masalah produk
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Contoh: Gelang patah saat pertama dipakai, ada bagian manik yang lepas..."
          disabled={saving}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none disabled:opacity-50"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{description.length}/1000</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-pill bg-greeva-forest py-2 text-xs font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50 transition-colors"
        >
          {saving ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-pill border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
