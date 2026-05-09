'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ProductForm, type ProductFormValues } from '@/components/partner/ProductForm';
import { createPartnerProduct } from '@/lib/api/partner';

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(values: ProductFormValues) {
    await createPartnerProduct({
      name: values.name,
      description: values.description,
      short_description: values.short_description,
      price: Math.round(values.price * 100), // rupiah → sen
      compare_price: values.compare_price ? Math.round(values.compare_price * 100) : null,
      category_id: values.category_id,
      weight: values.weight,
      material: values.material,
      sustainability_notes: values.sustainability_notes,
    });
    router.push('/partner/products');
  }

  return (
    <div>
      <PageHeader title="Tambah Produk" />
      <ProductForm onSubmit={handleSubmit} submitLabel="Simpan & Tambahkan" />
    </div>
  );
}
