import { client } from './client';

export async function uploadImage(file: File, folder: 'products' | 'partners' | 'categories' = 'products'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const { data } = await client.post<{ data: { url: string } }>('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data.url;
}
