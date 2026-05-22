'use client';

import { useState } from 'react';
import { StarRatingInput } from './StarRating';
import { createReview, updateReview, type ReviewPayload } from '@/lib/api/reviews';
import type { Review, OrderItemReview } from '@/types/review';

interface ReviewFormProps {
  orderNumber: string;
  itemId: number;
  /** If provided, form is in edit mode */
  existing?: OrderItemReview | null;
  onSuccess: (review: Review) => void;
  onCancel?: () => void;
}

export function ReviewForm({ orderNumber, itemId, existing, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [body, setBody] = useState(existing?.body ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError('Pilih rating dulu (minimal 1 bintang).');
      return;
    }
    setSaving(true);
    setError('');

    const payload: ReviewPayload = { rating, body: body.trim() || null };

    try {
      const review = existing
        ? await updateReview(existing.id, payload)
        : await createReview(orderNumber, itemId, payload);
      onSuccess(review);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Gagal menyimpan ulasan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-greeva-black">Rating</p>
        <StarRatingInput value={rating} onChange={setRating} disabled={saving} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-greeva-black">
          Ulasan{' '}
          <span className="text-xs font-normal text-gray-400">(opsional)</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Bagikan pengalamanmu dengan produk ini..."
          disabled={saving}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none disabled:opacity-50"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{body.length}/2000</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-pill bg-greeva-forest px-6 py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50 transition-colors"
        >
          {saving ? 'Menyimpan...' : existing ? 'Simpan Perubahan' : 'Kirim Ulasan'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-pill border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
