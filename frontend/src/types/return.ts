export type ReturnReason =
  | 'damaged'
  | 'not_as_described'
  | 'wrong_item'
  | 'changed_mind'
  | 'other';

export type ReturnStatus = 'pending' | 'approved' | 'rejected';

export interface ReturnRequest {
  id: number;
  return_number: string;
  order_id: number;
  order_number?: string;
  reason: ReturnReason;
  description: string;
  photos: string[];
  status: ReturnStatus;
  status_label: string;
  admin_note: string | null;
  resolved_at: string | null;
  resolved_by?: string | null;
  created_at: string;
  buyer?: { id: number; name: string; email: string } | null;
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  damaged: 'Produk rusak/cacat',
  not_as_described: 'Tidak sesuai deskripsi',
  wrong_item: 'Barang salah kirim',
  changed_mind: 'Berubah pikiran',
  other: 'Lainnya',
};
