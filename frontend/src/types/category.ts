export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
  parent?: { id: number; name: string; slug: string } | null;
  children?: Category[];
}
