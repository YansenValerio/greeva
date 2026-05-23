'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  type AdminCategoryPayload,
} from '@/lib/api/admin';
import { toast, confirm } from '@/lib/feedback';
import type { Category } from '@/types/category';

interface FormState {
  parent_id: string; // string for select; '' = no parent
  name: string;
  description: string;
  image: string;
  sort_order: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  parent_id: '',
  name: '',
  description: '',
  image: '',
  sort_order: '0',
  is_active: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await adminGetCategories();
      setCategories(data);
    } catch {
      setError('Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  }

  // Build tree: roots first, children indented
  const tree = useMemo(() => buildTree(categories), [categories]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      parent_id: category.parent_id?.toString() ?? '',
      name: category.name,
      description: category.description ?? '',
      image: category.image ?? '',
      sort_order: category.sort_order.toString(),
      is_active: category.is_active,
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');

    const payload: AdminCategoryPayload = {
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      name: form.name.trim(),
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminUpdateCategory(editingId, payload);
        toast.success('Kategori berhasil diperbarui.');
      } else {
        await adminCreateCategory(payload);
        toast.success('Kategori baru ditambahkan.');
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Gagal menyimpan kategori.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const ok = await confirm({
      title: 'Hapus kategori?',
      message: `Kategori "${category.name}" akan dihapus permanen. Pastikan tidak ada produk atau subkategori yang masih menggunakannya.`,
      confirmText: 'Hapus',
      danger: true,
    });
    if (!ok) return;
    try {
      await adminDeleteCategory(category.id);
      toast.success('Kategori dihapus.');
      await loadCategories();
      if (editingId === category.id) resetForm();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Gagal menghapus kategori.');
    }
  }

  // Parent options exclude self (and descendants) when editing
  const parentOptions = useMemo(() => {
    if (!editingId) return categories;
    const descendants = new Set<number>([editingId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of categories) {
        if (c.parent_id && descendants.has(c.parent_id) && !descendants.has(c.id)) {
          descendants.add(c.id);
          changed = true;
        }
      }
    }
    return categories.filter((c) => !descendants.has(c.id));
  }, [categories, editingId]);

  return (
    <div>
      <PageHeader title="Kategori" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="rounded-card bg-greeva-sand-warm p-5">
            <h2 className="mb-4 font-semibold text-greeva-black">
              {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Nama</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Kategori Induk
                </label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                >
                  <option value="">— Tidak ada (root) —</option>
                  {parentOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">URL Gambar</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Urutan</label>
                <input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-greeva-forest focus:outline-none"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 accent-greeva-forest"
                />
                <span className="text-sm text-greeva-black">Aktif</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50 transition-colors"
                >
                  {saving
                    ? 'Menyimpan...'
                    : editingId
                      ? 'Simpan Perubahan'
                      : 'Tambah Kategori'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-pill border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-card bg-gray-100" />
              ))}
            </div>
          ) : tree.length === 0 ? (
            <div className="rounded-card bg-white py-10 text-center shadow-card">
              <p className="text-sm text-gray-400">Belum ada kategori. Tambahkan di form sebelah.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
              {tree.map(({ category, depth }) => (
                <div
                  key={category.id}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                    editingId === category.id ? 'bg-greeva-mint-light/40' : ''
                  }`}
                  style={{ paddingLeft: `${20 + depth * 24}px` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {depth > 0 && <span className="text-gray-300">└</span>}
                      <p className="font-medium text-greeva-black">{category.name}</p>
                      {!category.is_active && (
                        <Badge variant="gray">Nonaktif</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      <span className="font-mono">{category.slug}</span>
                      {category.products_count !== undefined && (
                        <>
                          {' · '}
                          {category.products_count} produk
                        </>
                      )}
                      {' · '}urutan {category.sort_order}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="rounded-pill border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="rounded-pill border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface TreeNode {
  category: Category;
  depth: number;
}

function buildTree(categories: Category[]): TreeNode[] {
  const byParent = new Map<number | null, Category[]>();
  for (const c of categories) {
    const key = c.parent_id;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }

  const result: TreeNode[] = [];
  const visit = (parentId: number | null, depth: number) => {
    const children = (byParent.get(parentId) ?? []).slice().sort(
      (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
    );
    for (const c of children) {
      result.push({ category: c, depth });
      visit(c.id, depth + 1);
    }
  };
  visit(null, 0);
  return result;
}
