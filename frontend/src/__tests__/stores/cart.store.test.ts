import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCartStore } from '@/stores/cart.store';
import * as cartApi from '@/lib/api/cart';
import type { CartItem } from '@/types/cart';

vi.mock('@/lib/api/cart');

function makeItem(variantId: number, price: number, qty: number): CartItem {
  return {
    variant_id: variantId,
    product_id: 1,
    partner_id: 1,
    product_name: 'Test Product',
    variant_name: 'Default',
    sku: `SKU-${variantId}`,
    product_image: null,
    price,
    quantity: qty,
  };
}

describe('useCartStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [], count: 0, subtotal: 0, isLoading: false });
  });

  describe('addItem', () => {
    it('adds a new item to an empty cart', async () => {
      const item = makeItem(1, 8_500_000, 1);
      vi.mocked(cartApi.addCartItem).mockResolvedValue(item);

      await useCartStore.getState().addItem(1, 1);

      const { items, count, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(count).toBe(1);
      expect(subtotal).toBe(8_500_000);
    });

    it('updates quantity when adding an item that already exists', async () => {
      const existing = makeItem(1, 8_500_000, 1);
      useCartStore.setState({ items: [existing], count: 1, subtotal: 8_500_000 });

      const updated = makeItem(1, 8_500_000, 2);
      vi.mocked(cartApi.addCartItem).mockResolvedValue(updated);

      await useCartStore.getState().addItem(1, 1);

      const { items, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
      expect(subtotal).toBe(17_000_000);
    });
  });

  describe('updateItem', () => {
    it('updates item quantity and recalculates subtotal', async () => {
      const item = makeItem(1, 5_000_000, 1);
      useCartStore.setState({ items: [item], count: 1, subtotal: 5_000_000 });

      const updated = makeItem(1, 5_000_000, 3);
      vi.mocked(cartApi.updateCartItem).mockResolvedValue(updated);

      await useCartStore.getState().updateItem(1, 3);

      const { items, subtotal } = useCartStore.getState();
      expect(items[0].quantity).toBe(3);
      expect(subtotal).toBe(15_000_000);
    });

    it('delegates to removeItem when quantity is 0', async () => {
      const item = makeItem(1, 5_000_000, 1);
      useCartStore.setState({ items: [item], count: 1, subtotal: 5_000_000 });
      vi.mocked(cartApi.removeCartItem).mockResolvedValue(undefined);

      await useCartStore.getState().updateItem(1, 0);

      expect(cartApi.removeCartItem).toHaveBeenCalledWith(1);
      expect(cartApi.updateCartItem).not.toHaveBeenCalled();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('removes item and recalculates subtotal for remaining items', async () => {
      const item1 = makeItem(1, 5_000_000, 2); // 10_000_000
      const item2 = makeItem(2, 3_000_000, 1); // 3_000_000
      useCartStore.setState({ items: [item1, item2], count: 2, subtotal: 13_000_000 });
      vi.mocked(cartApi.removeCartItem).mockResolvedValue(undefined);

      await useCartStore.getState().removeItem(1);

      const { items, count, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].variant_id).toBe(2);
      expect(count).toBe(1);
      expect(subtotal).toBe(3_000_000);
    });
  });

  describe('fetch', () => {
    it('populates the store from the API response', async () => {
      const items = [makeItem(1, 8_500_000, 2)];
      vi.mocked(cartApi.getCart).mockResolvedValue({ items, count: 1, subtotal: 17_000_000 });

      await useCartStore.getState().fetch();

      const { items: storeItems, count, subtotal } = useCartStore.getState();
      expect(storeItems).toHaveLength(1);
      expect(count).toBe(1);
      expect(subtotal).toBe(17_000_000);
    });

    it('resets to empty on API failure', async () => {
      useCartStore.setState({ items: [makeItem(1, 1000, 1)], count: 1, subtotal: 1000 });
      vi.mocked(cartApi.getCart).mockRejectedValue(new Error('Network error'));

      await useCartStore.getState().fetch();

      const { items, count, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(count).toBe(0);
      expect(subtotal).toBe(0);
    });
  });

  describe('clear', () => {
    it('empties the cart', async () => {
      useCartStore.setState({ items: [makeItem(1, 5_000_000, 1)], count: 1, subtotal: 5_000_000 });
      vi.mocked(cartApi.clearCart).mockResolvedValue(undefined);

      await useCartStore.getState().clear();

      const { items, count, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(count).toBe(0);
      expect(subtotal).toBe(0);
    });
  });

  describe('subtotal calculation', () => {
    it('correctly sums price × quantity across multiple items', async () => {
      const item1 = makeItem(1, 10_000_000, 2); // 20_000_000
      const item2 = makeItem(2, 5_000_000, 3);  // 15_000_000
      vi.mocked(cartApi.addCartItem).mockResolvedValueOnce(item1);
      vi.mocked(cartApi.addCartItem).mockResolvedValueOnce(item2);

      await useCartStore.getState().addItem(1, 2);
      await useCartStore.getState().addItem(2, 3);

      expect(useCartStore.getState().subtotal).toBe(35_000_000);
    });
  });
});
