'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import type { ProductVariant } from '@/types/product';
import {
  createPartnerVariant,
  updatePartnerVariant,
  deletePartnerVariant,
  type StoreVariantPayload,
} from '@/lib/api/partner';
import { toast, confirm } from '@/lib/feedback';

interface VariantManagerProps {
  productId: number;
  variants: ProductVariant[];
  productPrice: number; // sen, sebagai fallback price display
}

interface VariantFormState {
  sku: string;
  name: string;
  stock: string;
  price: string; // rupiah, kosong = pakai harga produk
}

const emptyForm: VariantFormState = { sku: '', name: '', stock: '', price: '' };

function toPayload(form: VariantFormState): StoreVariantPayload {
  return {
    sku: form.sku.trim(),
    name: form.name.trim(),
    stock: parseInt(form.stock) || 0,
    price: form.price ? Math.round(parseFloat(form.price) * 100) : null,
    is_active: true,
  };
}

export function VariantManager({ productId, variants: initial, productPrice }: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<VariantFormState>(emptyForm);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<VariantFormState>(emptyForm);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Add ──────────────────────────────────────────────────────────────────────

  async function handleAdd() {
    if (!addForm.name.trim() || !addForm.sku.trim() || !addForm.stock) {
      setAddError('Nama, SKU, dan stok wajib diisi.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const created = await createPartnerVariant(productId, toPayload(addForm));
      setVariants((v) => [...v, created]);
      setAddForm(emptyForm);
      setShowAdd(false);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Gagal menambah varian.';
      setAddError(msg);
    } finally {
      setAddLoading(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────

  function startEdit(v: ProductVariant) {
    setEditingId(v.id);
    setEditError('');
    setEditForm({
      sku: v.sku,
      name: v.name,
      stock: String(v.stock),
      price: v.price ? String(v.price / 100) : '',
    });
  }

  async function handleEdit(variantId: number) {
    setEditLoading(true);
    setEditError('');
    try {
      const updated = await updatePartnerVariant(productId, variantId, toPayload(editForm));
      setVariants((vv) => vv.map((v) => (v.id === variantId ? updated : v)));
      setEditingId(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menyimpan perubahan.';
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async function handleDelete(variantId: number) {
    const variant = variants.find((v) => v.id === variantId);
    const ok = await confirm({
      title: 'Hapus varian?',
      message: `Varian "${variant?.name ?? variant?.sku ?? 'ini'}" akan dihapus.`,
      confirmText: 'Hapus',
      danger: true,
    });
    if (!ok) return;
    setDeletingId(variantId);
    try {
      await deletePartnerVariant(productId, variantId);
      setVariants((vv) => vv.filter((v) => v.id !== variantId));
      toast.success('Varian dihapus.');
    } catch {
      toast.error('Gagal menghapus varian.');
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-greeva-black">Varian & Stok</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Setiap produk butuh minimal 1 varian agar bisa ditambahkan ke keranjang.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowAdd(true); setAddError(''); }}
          className="flex items-center gap-1.5 rounded-pill border border-greeva-forest px-3 py-1.5 text-xs font-semibold text-greeva-forest hover:bg-greeva-mint-light"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Varian
        </button>
      </div>

      {/* Existing variants */}
      {variants.length === 0 && !showAdd ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
          <p className="text-sm text-gray-400">Belum ada varian. Tambah minimal 1 varian untuk mengatur stok.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-card border border-gray-100 bg-white">
          {variants.map((v) =>
            editingId === v.id ? (
              // Edit row
              <div key={v.id} className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Nama Varian *</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
                      placeholder="Default / Merah / Size S"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">SKU *</label>
                    <input
                      value={editForm.sku}
                      onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
                      placeholder="NTC-GEL-001"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Stok *</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.stock}
                      onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Harga Varian (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.price}
                      onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
                      placeholder={`Kosong = pakai harga produk`}
                    />
                  </div>
                </div>
                {editError && <p className="text-xs text-red-600">{editError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(v.id)}
                    disabled={editLoading}
                    className="flex items-center gap-1 rounded-lg bg-greeva-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {editLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              // Display row
              <div key={v.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-greeva-black">{v.name}</span>
                    {!v.is_active && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">Nonaktif</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                    <span>SKU: {v.sku}</span>
                    <span>
                      Stok: <span className={v.stock === 0 ? 'font-semibold text-red-500' : 'font-semibold text-greeva-forest-dark'}>{v.stock}</span>
                    </span>
                    {v.price && (
                      <span>Rp {(v.price / 100).toLocaleString('id-ID')}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(v)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-greeva-forest"
                    aria-label="Edit varian"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    aria-label="Hapus varian"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          )}

          {/* Add form inline */}
          {showAdd && (
            <div className="space-y-3 p-4 bg-greeva-mint-light/30">
              <p className="text-xs font-semibold text-greeva-forest-dark">Varian Baru</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Nama Varian *</label>
                  <input
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
                    placeholder="Default / Merah / Size S"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">SKU *</label>
                  <input
                    value={addForm.sku}
                    onChange={(e) => setAddForm((f) => ({ ...f, sku: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
                    placeholder="NTC-GEL-001"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Stok *</label>
                  <input
                    type="number"
                    min={0}
                    value={addForm.stock}
                    onChange={(e) => setAddForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Harga Varian (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={addForm.price}
                    onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
                    placeholder={`Kosong = Rp ${(productPrice / 100).toLocaleString('id-ID')}`}
                  />
                </div>
              </div>
              {addError && <p className="text-xs text-red-600">{addError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={addLoading}
                  className="flex items-center gap-1 rounded-lg bg-greeva-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {addLoading ? 'Menyimpan...' : 'Tambah'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAdd(false); setAddForm(emptyForm); setAddError(''); }}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Tip: Jika produk tidak punya variasi (ukuran/warna), tambah 1 varian bernama &ldquo;Default&rdquo; dengan stok yang sesuai.
      </p>
    </div>
  );
}
