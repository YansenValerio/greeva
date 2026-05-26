export interface AdminRevenueTrendPoint {
  month: string; // YYYY-MM
  revenue: number; // sen
  orders: number;
}

export interface AdminRevenue {
  this_month: number; // sen
  last_month: number; // sen
  change_percent: number | null;
  monthly_trend: AdminRevenueTrendPoint[];
}

export interface AdminOrdersSummary {
  this_month: number;
  pending_payment: number;
  needs_fulfillment: number;
}

export interface AdminPayoutsSummary {
  pending_batches: number;
  pending_amount: number; // sen
  available_earnings: number; // sen
}

export interface AdminTopPartner {
  partner_id: number;
  name: string;
  gross_sales: number; // sen
  units_sold: number;
}

export interface AdminTopCategory {
  category_id: number;
  name: string;
  gross_sales: number; // sen
  units_sold: number;
}

export interface AdminLowStockItem {
  variant_id: number;
  product_id: number;
  product_name: string;
  variant_name: string;
  partner_name: string;
  sku: string;
  stock: number;
}

export interface AdminDashboard {
  revenue: AdminRevenue;
  orders: AdminOrdersSummary;
  payouts: AdminPayoutsSummary;
  top_partners: AdminTopPartner[];
  top_categories: AdminTopCategory[];
  low_stock: AdminLowStockItem[];
}
