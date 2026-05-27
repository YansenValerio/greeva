'use client';

import { useEffect } from 'react';
import { recordRecentlyViewed, type RecentProduct } from '@/lib/recentlyViewed';

export function TrackRecentlyViewed({ product }: { product: RecentProduct }) {
  useEffect(() => {
    recordRecentlyViewed(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}
