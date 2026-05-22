/**
 * Helper untuk mengelola guest cart token di localStorage.
 * Token di-generate sekali, lalu dipakai untuk semua request cart sebelum login.
 */

const STORAGE_KEY = 'greeva_guest_cart_token';

/** Generate UUID-like token (kompatibel dengan validasi backend) */
function generateToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback untuk environment lama
  return 'gst-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}

/** Ambil token jika ada, tanpa create */
export function getGuestCartToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

/** Ambil token, generate jika belum ada */
export function ensureGuestCartToken(): string {
  if (typeof window === 'undefined') {
    return generateToken();
  }
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = generateToken();
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
}

/** Hapus token (setelah merge ke auth cart) */
export function clearGuestCartToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
