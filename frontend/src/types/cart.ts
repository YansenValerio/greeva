export interface CartItem {
  variant_id: number;
  product_id: number;
  partner_id: number;
  product_name: string;
  variant_name: string;
  sku: string;
  product_image: string | null;
  price: number; // sen
  quantity: number;
}

export interface CartData {
  items: CartItem[];
  count: number;
  subtotal: number; // sen
}
