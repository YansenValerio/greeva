import { describe, it, expect } from 'vitest';
import { checkoutSchema } from '@/lib/schemas/checkout';

const valid = {
  shipping_name: 'Budi Santoso',
  shipping_phone: '081234567890',
  shipping_address: 'Jl. Sudirman No. 123, Kelurahan Setiabudi',
  shipping_province: 'DKI Jakarta',
  shipping_city: 'Jakarta Selatan',
  shipping_postal_code: '12190',
};

describe('checkoutSchema', () => {
  it('accepts complete valid data', () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional fields as absent', () => {
    const result = checkoutSchema.safeParse({ ...valid, shipping_district: undefined, notes: undefined });
    expect(result.success).toBe(true);
  });

  it('accepts optional fields when provided', () => {
    const result = checkoutSchema.safeParse({
      ...valid,
      shipping_district: 'Kebayoran Baru',
      notes: 'Tolong dibungkus rapi',
    });
    expect(result.success).toBe(true);
  });

  describe('shipping_name', () => {
    it('rejects names shorter than 2 characters', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_name: 'A' });
      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors.shipping_name).toBeDefined();
    });

    it('rejects empty string', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_name: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('shipping_phone', () => {
    it('rejects alphabetic characters', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_phone: 'abcdefgh' });
      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors.shipping_phone).toBeDefined();
    });

    it('rejects numbers shorter than 8 digits', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_phone: '0812' });
      expect(result.success).toBe(false);
    });

    it('accepts number with + prefix', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_phone: '+628123456789' });
      expect(result.success).toBe(true);
    });
  });

  describe('shipping_address', () => {
    it('rejects addresses shorter than 10 characters', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_address: 'Jl. A' });
      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors.shipping_address).toBeDefined();
    });
  });

  describe('shipping_province and shipping_city', () => {
    it('rejects empty province', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_province: '' });
      expect(result.success).toBe(false);
    });

    it('rejects empty city', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_city: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('shipping_postal_code', () => {
    it('rejects code shorter than 5 digits', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_postal_code: '1234' });
      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors.shipping_postal_code).toBeDefined();
    });

    it('rejects code longer than 5 digits', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_postal_code: '123456' });
      expect(result.success).toBe(false);
    });

    it('rejects non-digit characters', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_postal_code: '1234A' });
      expect(result.success).toBe(false);
    });

    it('accepts exactly 5 numeric digits', () => {
      const result = checkoutSchema.safeParse({ ...valid, shipping_postal_code: '10110' });
      expect(result.success).toBe(true);
    });
  });
});
