import type { Category } from './category';

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  price: number | null; // sen; null = gunakan product.price
  stock: number;
  images: string[];
  sort_order: number;
  is_active: boolean;
}

export interface ProductPartner {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  status: string;
  status_label: string;
  price: number;             // sen
  compare_price: number | null; // sen
  price_formatted: string;
  images: string[];
  weight: number | null;
  material: string | null;
  sustainability_notes: string | null;
  meta_title: string | null;
  meta_description: string | null;
  total_stock: number;
  created_at: string;
  updated_at: string;
  partner?: ProductPartner;
  category?: Category;
  variants?: ProductVariant[];
}
