export type VoucherType = 'percent' | 'fixed';

export interface Voucher {
  id: number;
  code: string;
  description: string | null;
  type: VoucherType;
  type_label: string;
  value: number; // persen 1-100, atau nominal sen
  discount_label: string;
  max_discount: number | null;
  max_discount_formatted: string | null;
  min_purchase: number; // sen
  min_purchase_formatted: string;
  valid_from: string | null;
  valid_until: string | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  first_order_only: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AdminVoucherPayload {
  code: string;
  description?: string | null;
  type: VoucherType;
  value: number;
  max_discount?: number | null;
  min_purchase?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  usage_limit?: number | null;
  per_user_limit?: number | null;
  first_order_only?: boolean;
  is_active?: boolean;
}

export interface VoucherPreviewResult {
  voucher_code: string;
  label: string;
  discount_amount: number; // sen
  discount_formatted: string;
}
