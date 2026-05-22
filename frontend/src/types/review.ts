export interface Review {
  id: number;
  rating: number;
  body: string | null;
  created_at: string;
  is_approved?: boolean;
  reviewer?: {
    name: string;
    is_self: boolean;
  };
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  order_item?: {
    id: number;
    variant_name: string;
  };
}

export interface ReviewSummary {
  total: number;
  average_rating: number | null;
}

export interface OrderItemReview {
  id: number;
  rating: number;
  body: string | null;
  created_at: string;
}
