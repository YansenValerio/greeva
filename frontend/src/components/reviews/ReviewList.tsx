'use client';

import { useEffect, useState } from 'react';
import { StarRating } from './StarRating';
import {
  getProductReviews,
  type ReviewSort,
  type ReviewListResponse,
} from '@/lib/api/reviews';

interface ReviewListProps {
  slug: string;
}

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'highest', label: 'Rating Tertinggi' },
  { value: 'lowest', label: 'Rating Terendah' },
];

export function ReviewList({ slug }: ReviewListProps) {
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<ReviewSort>('newest');

  useEffect(() => {
    setLoading(true);
    getProductReviews(slug, { sort, per_page: 10 })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug, sort]);

  if (loading && !data) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-card bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-card bg-greeva-mint-light/40 py-10 text-center">
        <p className="text-sm text-gray-500">
          Belum ada ulasan. Jadilah yang pertama setelah membeli produk ini.
        </p>
      </div>
    );
  }

  const summary = data.summary;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-greeva-sand-warm p-5">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-4xl font-bold text-greeva-black">
              {summary.average_rating?.toFixed(1) ?? '—'}
            </p>
          </div>
          <div>
            <StarRating value={summary.average_rating ?? 0} size={18} />
            <p className="mt-1 text-sm text-gray-500">{summary.total} ulasan</p>
          </div>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as ReviewSort)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-4">
        {data.data.map((review) => (
          <article
            key={review.id}
            className="rounded-card bg-white p-5 shadow-card"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-greeva-black">
                  {review.reviewer?.name ?? 'Pembeli'}
                  {review.reviewer?.is_self && (
                    <span className="ml-2 text-xs font-normal text-greeva-starbucks-green">
                      (ulasan kamu)
                    </span>
                  )}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <StarRating value={review.rating} size={14} />
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
            {review.body && (
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{review.body}</p>
            )}
          </article>
        ))}
      </div>

      {/* Pagination indicator */}
      {data.meta.last_page > 1 && (
        <p className="text-center text-sm text-gray-400">
          Menampilkan {data.data.length} dari {data.meta.total} ulasan
        </p>
      )}
    </div>
  );
}
