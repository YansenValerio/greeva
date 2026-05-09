import { Container } from '@/components/shared/Container';

export default function ProductLoading() {
  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="mb-8 h-4 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
          <div className="aspect-square animate-pulse rounded-card bg-gray-200" />
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-24 animate-pulse rounded-card bg-gray-100" />
            <div className="h-14 w-48 animate-pulse rounded-pill bg-gray-200" />
          </div>
        </div>
      </Container>
    </main>
  );
}
