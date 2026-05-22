import axios from 'axios';
import { getGuestCartToken } from '@/lib/guestCart';

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

  const authToken = localStorage.getItem('greeva_token');
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  // Selalu kirim X-Cart-Token jika ada — backend abaikan di endpoint non-cart.
  // Berguna untuk guest cart sebelum login.
  const guestCart = getGuestCartToken();
  if (guestCart) {
    config.headers['X-Cart-Token'] = guestCart;
  }

  return config;
});
