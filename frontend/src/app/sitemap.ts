import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://greeva.id';

async function fetchProducts(): Promise<{ slug: string; updated_at?: string }[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/products?per_page=200`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProducts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/tentang`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/mitra`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/mitra/notic`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/mitra/reperca`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/kontak`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/kebijakan-privasi`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/syarat-ketentuan`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
