export interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  sku: string;
  product_image: string | null;
  unit_price: number; // sen
  price_formatted: string;
  quantity: number;
  subtotal: number; // sen
  subtotal_formatted: string;
  product_id?: number;
  product_slug?: string | null;
  review?: {
    id: number;
    rating: number;
    body: string | null;
    created_at: string;
  } | null;
}

export interface OrderShipment {
  id: number;
  partner_id: number | null;
  tracking_number: string | null;
  courier: string | null;
  courier_service: string | null;
  status: string;
  packed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  can_be_cancelled: boolean;
  subtotal: number;
  subtotal_formatted: string;
  shipping_total: number;
  shipping_total_formatted: string;
  discount_total: number;
  grand_total: number;
  grand_total_formatted: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string | null;
  shipping_postal_code: string;
  shipping_courier: string | null;
  shipping_service: string | null;
  notes: string | null;
  payment_token: string | null;
  payment_url: string | null;
  payment_method: string | null;
  payment_expired_at: string | null;
  paid_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shipments?: OrderShipment[];
}

export interface CheckoutResult {
  data: Order;
  snap_token: string;
  payment_url: string;
  message: string;
}

export interface CheckoutPayload {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district?: string;
  shipping_postal_code: string;
  shipping_courier: string;
  shipping_service: string;
  notes?: string;
}
