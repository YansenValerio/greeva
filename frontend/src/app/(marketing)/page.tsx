import { getProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { HeroSection } from '@/components/home/HeroSection';
import { PartnerStrip } from '@/components/home/PartnerStrip';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { ImpactStrip } from '@/components/home/ImpactStrip';
import { StorySection, noticStory, repercaStory } from '@/components/home/StorySection';
import { SocialProof } from '@/components/home/SocialProof';
import { DualCTA } from '@/components/home/DualCTA';

async function getData() {
  try {
    const [featuredRes, latestRes, categories] = await Promise.all([
      getProducts({ per_page: 4, featured: true }),
      getProducts({ per_page: 4 }),
      getCategories(),
    ]);
    // Gunakan featured jika ada, fallback ke latest
    const products = featuredRes.data.length >= 4
      ? featuredRes.data
      : latestRes.data;
    return { products, categories };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getData();

  return (
    <main>
      {/* 1. Hero — full-bleed editorial (Vitra) */}
      <HeroSection />

      {/* 2. Partner credibility strip (Bite "as seen in") */}
      <PartnerStrip />

      {/* 3. Category grid — 2x2 landscape (Vitra) */}
      <CategoryGrid categories={categories} />

      {/* 4. Featured products — 4-col even grid (Bite) */}
      <FeaturedProducts products={products.slice(0, 4)} />

      {/* 5. Impact stats counter */}
      <ImpactStrip />

      {/* 6. Story — Notic (image kiri, teks kanan) */}
      <StorySection partner={noticStory} />

      {/* 7. Story — Reperca (teks kiri, image kanan) */}
      <StorySection partner={repercaStory} />

      {/* 8. Social proof — 3 testimonial */}
      <SocialProof />

      {/* 9. Dual CTA — buyer + mitra */}
      <DualCTA />
    </main>
  );
}
