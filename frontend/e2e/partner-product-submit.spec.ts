import { test, expect } from '@playwright/test';

const API = 'http://localhost:8000/api/v1';

const CATEGORIES = {
  data: [
    { id: 1, name: 'Aksesoris', slug: 'aksesoris' },
    { id: 2, name: 'Tas & Pouch', slug: 'tas-pouch' },
  ],
};

const CREATED_PRODUCT = {
  data: {
    id: 99,
    name: 'Gelang Manik HDPE Biru',
    slug: 'gelang-manik-hdpe-biru',
    status: 'draft',
    price: 8_500_000,
    created_at: new Date().toISOString(),
  },
};

const PRODUCTS_LIST = {
  data: [CREATED_PRODUCT.data],
  meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
};

test.describe('Partner product submit flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Set auth state as partner
      localStorage.setItem('greeva_token', 'partner-token');
      localStorage.setItem(
        'greeva-auth',
        JSON.stringify({
          state: {
            user: { id: 2, name: 'Notic Team', email: 'notic@test.com', role: 'partner' },
            token: 'partner-token',
            isAuthenticated: true,
          },
          version: 0,
        }),
      );
    });

    // Mock categories
    await page.route(`${API}/categories`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CATEGORIES) });
    });

    // Mock partner products (GET list + POST create)
    await page.route(`${API}/partner/products`, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(CREATED_PRODUCT),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(PRODUCTS_LIST),
        });
      }
    });

    // Mock partner products detail/sub-routes
    await page.route(`${API}/partner/products/**`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CREATED_PRODUCT) });
    });
  });

  test('shows the product form when authenticated as partner', async ({ page }) => {
    await page.goto('/partner/products/new');
    await expect(page.getByPlaceholder('Gelang Manik HDPE')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByPlaceholder('85000')).toBeVisible();
  });

  test('redirects non-partner users away', async ({ page }) => {
    // Override to buyer role
    await page.addInitScript(() => {
      localStorage.setItem(
        'greeva-auth',
        JSON.stringify({
          state: {
            user: { id: 1, name: 'Buyer', email: 'buyer@test.com', role: 'buyer' },
            token: 'buyer-token',
            isAuthenticated: true,
          },
          version: 0,
        }),
      );
    });

    await page.goto('/partner/products/new');
    // useRoleGuard redirects buyers to /
    await expect(page).toHaveURL('/', { timeout: 8_000 });
  });

  test('submits a valid product and redirects to products list', async ({ page }) => {
    await page.goto('/partner/products/new');

    // Wait for form and categories to load
    await expect(page.getByPlaceholder('Gelang Manik HDPE')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('option', { name: 'Aksesoris' })).toBeVisible({ timeout: 5_000 });

    // Fill in required fields
    await page.getByPlaceholder('Gelang Manik HDPE').fill('Gelang Manik HDPE Biru');
    await page.getByPlaceholder('85000').fill('85000');
    await page.getByPlaceholder('50').fill('30');
    await page.locator('select').first().selectOption({ value: '1' });
    await page.getByPlaceholder('Plastik HDPE daur ulang').fill('Plastik HDPE daur ulang');

    // Submit
    await page.getByRole('button', { name: 'Simpan & Tambahkan' }).click();

    // Redirects to partner products list
    await expect(page).toHaveURL('/partner/products', { timeout: 10_000 });
  });

  test('shows validation error when required fields are empty', async ({ page }) => {
    await page.goto('/partner/products/new');
    await expect(page.getByPlaceholder('Gelang Manik HDPE')).toBeVisible({ timeout: 10_000 });

    // Submit empty form
    await page.getByRole('button', { name: 'Simpan & Tambahkan' }).click();

    await expect(page.getByText('Nama produk wajib diisi')).toBeVisible();
    await expect(page.getByText('Harga wajib diisi')).toBeVisible();
  });

  test('shows validation error for invalid weight', async ({ page }) => {
    await page.goto('/partner/products/new');
    await expect(page.getByPlaceholder('Gelang Manik HDPE')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('option', { name: 'Aksesoris' })).toBeVisible({ timeout: 5_000 });

    await page.getByPlaceholder('Gelang Manik HDPE').fill('Test Produk');
    await page.getByPlaceholder('85000').fill('85000');
    await page.getByPlaceholder('50').fill('0'); // invalid: must be >= 1
    await page.locator('select').first().selectOption({ value: '1' });

    await page.getByRole('button', { name: 'Simpan & Tambahkan' }).click();

    await expect(page.getByText('Berat wajib diisi')).toBeVisible();
  });
});
