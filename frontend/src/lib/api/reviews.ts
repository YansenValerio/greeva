import { client } from './client';
import type { ApiCollection, ApiItem } from '@/types/api';
import type { Review, ReviewSummary } from '@/types/review';

export type ReviewSort = 'newest' | 'highest' | 'lowest';

export interface ReviewListParams {
  page?: number;
  per_page?: number;
  sort?: ReviewSort;
}

export interface ReviewListResponse extends ApiCollection<Review> {
  summary: ReviewSummary;
}

export async function getProductReviews(
  slug: string,
  params?: ReviewListParams,
): Promise<ReviewListResponse> {
  const { data } = await client.get<ReviewListResponse>(`/products/${slug}/reviews`, { params });
  return data;
}

export interface ReviewPayload {
  rating: number;
  body?: string | null;
}

export async function createReview(
  orderNumber: string,
  itemId: number,
  payload: ReviewPayload,
): Promise<Review> {
  const { data } = await client.post<ApiItem<Review>>(
    `/orders/${orderNumber}/items/${itemId}/review`,
    payload,
  );
  return data.data;
}

export async function updateReview(reviewId: number, payload: ReviewPayload): Promise<Review> {
  const { data } = await client.put<ApiItem<Review>>(`/reviews/${reviewId}`, payload);
  return data.data;
}

export async function deleteReview(reviewId: number): Promise<void> {
  await client.delete(`/reviews/${reviewId}`);
}
