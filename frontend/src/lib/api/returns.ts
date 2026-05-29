import { client } from './client';
import type { ApiCollection } from '@/types/api';
import type { ReturnRequest, ReturnReason } from '@/types/return';

export interface CreateReturnPayload {
  reason: ReturnReason;
  description: string;
  photos?: string[];
}

// ── Buyer ────────────────────────────────────────────────────────────────────

export async function createReturnRequest(
  orderNumber: string,
  payload: CreateReturnPayload,
): Promise<ReturnRequest> {
  const { data } = await client.post<{ data: ReturnRequest }>(
    `/orders/${orderNumber}/return`,
    payload,
  );
  return data.data;
}

export async function getMyReturns(page = 1): Promise<ApiCollection<ReturnRequest>> {
  const { data } = await client.get<ApiCollection<ReturnRequest>>('/returns', {
    params: { page, per_page: 15 },
  });
  return data;
}
