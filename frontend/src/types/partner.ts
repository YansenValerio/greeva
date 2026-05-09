export interface Partner {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  is_active: boolean;
  joined_at: string | null;
  revenue_share_percent?: number;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  user?: { id: number; name: string; email: string };
}

export interface EarningSummary {
  pending: number;
  available: number;
  paid: number;
}

export interface PartnerEarning {
  id: number;
  partner_id: number;
  order_id: number;
  order_item_id: number;
  payout_batch_id: number | null;
  amount: number; // sen
  status: 'pending' | 'available' | 'paid' | 'reversed';
  status_label: string;
  order_completed_at: string | null;
  available_at: string | null;
  paid_at: string | null;
  reversed_at: string | null;
  reversal_reason: string | null;
  order_item?: {
    product_name: string;
    variant_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  };
}

export interface PayoutBatch {
  id: number;
  payout_number: string;
  partner_id: number;
  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'failed';
  status_label: string;
  total_amount: number; // sen
  item_count: number;
  period_start: string;
  period_end: string;
  payment_proof: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_at: string;
  partner?: { id: number; name: string; slug: string };
  items?: PartnerEarning[];
}
