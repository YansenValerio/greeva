import { client } from './client';
import type { ApiCollection } from '@/types/api';
import type { Category } from '@/types/category';

export async function getCategories(): Promise<Category[]> {
  const { data } = await client.get<ApiCollection<Category>>('/categories');
  return data.data;
}
