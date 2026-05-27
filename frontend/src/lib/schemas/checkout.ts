import { z } from 'zod';

export const checkoutSchema = z.object({
  shipping_name: z.string().min(2, 'Nama penerima wajib diisi.').max(255),
  shipping_phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,20}$/, 'Nomor telepon tidak valid.'),
  shipping_address: z.string().min(10, 'Alamat terlalu pendek.').max(1000),
  shipping_province: z.string().min(1, 'Provinsi wajib diisi.'),
  shipping_city: z.string().min(1, 'Kota/Kabupaten wajib diisi.'),
  shipping_district: z.string().max(100).optional(),
  shipping_postal_code: z
    .string()
    .length(5, 'Kode pos harus 5 digit angka.')
    .regex(/^\d{5}$/, 'Kode pos harus berupa angka.'),
  shipping_courier: z.string().min(1, 'Pilih kurir pengiriman.'),
  shipping_service: z.string().min(1, 'Pilih layanan pengiriman.'),
  notes: z.string().max(500).optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
