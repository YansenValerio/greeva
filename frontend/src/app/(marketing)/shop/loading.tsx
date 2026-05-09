import { Container } from '@/components/shared/Container';

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-card bg-white shadow-card">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function ShopLoading() {
  return (
    <main>
      <section className="bg-greeva-sand-warm py-10 md:py-12">
        <Container>
          <div className="animate-pulse space-y-2">
            <div className="h-3 w-24 rounded bg-gray-300" />
            <div className="h-10 w-32 rounded bg-gray-300" />
          </div>
        </Container>
      </section>
      <section className="py-10 md:py-14">
        <Container>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
