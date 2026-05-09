import { test, expect } from '@playwright/test';

const API = 'http://localhost:8000/api/v1';

const CART_WITH_ITEM = {
  data: {
    items: [
      {
        variant_id: 1,
        product_id: 1,
        partner_id: 1,
        product_name: 'Gelang Manik HDPE',
        variant_name: 'Biru',
        sku: 'NTC-001',
        product_image: null,
        price: 8_500_000,
        quantity: 1,
      },
    ],
    count: 1,
    subtotal: 8_500_000,
  },
};

const CHECKOUT_RESULT = {
  snap_token: 'test-snap-token',
  data: {
    id: 1,
    order_number: 'GRV-2026-001',
    status: 'pending_payment',
    total_amount: 8_500_000,
    items: [],
    created_at: new Date().toISOString(),
  },
};

test.describe('Buyer checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    // Block Midtrans CDN and mock window.snap before any page script runs
    await page.route('**/snap.midtrans.com/**', (route) => route.fulfill({ status: 200, body: '' }));
    await page.route('**/app.midtrans.com/**', (route) => route.fulfill({ status: 200, body: '' }));

    await page.addInitScript(() => {
      // Set auth state so Zustand persist hydrates as authenticated buyer
      localStorage.setItem('greeva_token', 'test-token');
      localStorage.setItem(
        'greeva-auth',
        JSON.stringify({
          state: {
            user: { id: 1, name: 'Budi Santoso', email: 'budi@test.com', role: 'buyer' },
            token: 'test-token',
            isAuthenticated: true,
          },
          version: 0,
        }),
      );

      // Mock Midtrans snap widget — immediately calls onSuccess
      (window as unknown as Record<string, unknown>).snap = {
        pay: (_token: string, callbacks: Record<string, () => void>) => {
          setTimeout(() => callbacks.onSuccess?.(), 50);
        },
      };
    });

    // Mock cart API
    await page.route(`${API}/cart`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CART_WITH_ITEM) });
      } else {
        route.continue();
      }
    });

    // Mock checkout endpoint
    await page.route(`${API}/checkout`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CHECKOUT_RESULT),
      });
    });
  });

  test('shows checkout form when authenticated with items in cart', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.getByText('Alamat Pengiriman')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Gelang Manik HDPE')).toBeVisible();
  });

  test('redirects to /login when not authenticated', async ({ page }) => {
    // Override auth state to unauthenticated
    await page.addInitScript(() => {
      localStorage.removeItem('greeva_token');
      localStorage.setItem(
        'greeva-auth',
        JSON.stringify({ state: { user: null, token: null, isAuthenticated: false }, version: 0 }),
      );
    });

    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });

  test('completes full checkout and redirects to order page', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.getByText('Alamat Pengiriman')).toBeVisible({ timeout: 10_000 });

    await page.getByPlaceholder('Nama lengkap penerima').fill('Budi Santoso');
    await page.getByPlaceholder('08xxxxxxxxxx').fill('081234567890');
    await page
      .getByPlaceholder('Nama jalan, nomor rumah, RT/RW, kelurahan...')
      .fill('Jl. Sudirman No. 123, Kelurahan Setiabudi, RT 01/RW 02');
    await page.getByPlaceholder('DKI Jakarta').fill('DKI Jakarta');
    await page.getByPlaceholder('Jakarta Selatan').fill('Jakarta Selatan');
    await page.getByPlaceholder('12345').fill('12190');

    await page.getByRole('button', { name: 'Lanjut ke Pembayaran' }).click();

    // After snap.pay onSuccess, cart resets and router redirects to order detail
    await expect(page).toHaveURL(/\/orders\/GRV-2026-001/, { timeout: 10_000 });
  });

  test('shows validation errors when required fields are empty', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.getByText('Alamat Pengiriman')).toBeVisible({ timeout: 10_000 });

    // Submit with empty form
    await page.getByRole('button', { name: 'Lanjut ke Pembayaran' }).click();

    await expect(page.getByText('Nama penerima wajib diisi.')).toBeVisible();
    await expect(page.getByText('Nomor telepon tidak valid.')).toBeVisible();
    await expect(page.getByText('Alamat terlalu pendek.')).toBeVisible();
  });
});
