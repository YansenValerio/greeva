'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ProductForm, type ProductFormValues } from '@/components/partner/ProductForm';
import { getPartnerProduct, updatePartnerProduct } from '@/lib/api/partner';
import type { Product } from '@/types/product';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPartnerProduct(Number(id))
      .then(setProduct)
      .catch(() => router.push('/partner/products'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit(values: ProductFormValues) {
    await updatePartnerProduct(Number(id), {
      name: values.name,
      description: values.description,
      short_description: values.short_description,
      price: Math.round(values.price * 100),
      compare_price: values.compare_price ? Math.round(values.compare_price * 100) : null,
      category_id: values.category_id,
      weight: values.weight,
      material: values.material,
      sustainability_notes: values.sustainability_notes,
    });
    router.push('/partner/products');
  }

  if (loading || !product) {
    return <div className="animate-pulse h-96 rounded-card bg-gray-100" />;
  }

  return (
    <div>
      <PageHeader title={`Edit: ${product.name}`} />
      <ProductForm
        defaultValues={{
          name: product.name,
          description: product.description ?? '',
          short_description: product.short_description ?? '',
          price: product.price / 100, // sen → rupiah untuk form
          compare_price: product.compare_price ? product.compare_price / 100 : undefined,
          category_id: product.category?.id ?? 0,
          weight: product.weight ?? 0,
          material: product.material ?? '',
          sustainability_notes: product.sustainability_notes ?? '',
        }}
        onSubmit={handleSubmit}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
