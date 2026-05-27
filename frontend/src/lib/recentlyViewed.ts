export interface RecentProduct {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  price: number; // sen
}

const KEY = 'greeva_recently_viewed';
const MAX = 8;

export function getRecentlyViewed(): RecentProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentProduct[]) : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(item: RecentProduct): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getRecentlyViewed().filter((p) => p.id !== item.id);
    list.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Abaikan error quota/parse — recently viewed bersifat best-effort.
  }
}
