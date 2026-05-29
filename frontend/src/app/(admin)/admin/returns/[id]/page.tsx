'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/shared/Badge';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { adminGetReturn, adminApproveReturn, adminRejectReturn } from '@/lib/api/admin';
import { toast, confirm } from '@/lib/feedback';
import { RETURN_REASON_LABELS, type ReturnRequest } from '@/types/return';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'gray'> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'gray',
};

export default function AdminReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ret, setRet] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminGetReturn(Number(id))
      .then(setRet)
      .catch(() => router.push('/admin/returns'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleApprove() {
    if (!ret) return;
    const note = window.prompt('Catatan persetujuan (opsional):') ?? undefined;
    const ok = await confirm({
      title: 'Setujui retur?',
      message: `Pesanan ${ret.order_number} akan direfund dan earning mitra dibatalkan. Tindakan ini tidak bisa dibatalkan.`,
      danger: true,
      confirmText: 'Setujui & Refund',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const updated = await adminApproveReturn(ret.id, note?.trim() || undefined);
      setRet(updated);
      toast.success('Retur disetujui. Pesanan direfund.');
    } catch {
      toast.error('Gagal menyetujui retur.');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!ret) return;
    const note = window.prompt('Alasan penolakan retur ini?');
    if (!note?.trim()) return;
    setBusy(true);
    try {
      const updated = await adminRejectReturn(ret.id, note.trim());
      setRet(updated);
      toast.success('Pengajuan retur ditolak.');
    } catch {
      toast.error('Gagal menolak retur.');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !ret) {
    return <div className="h-96 animate-pulse rounded-card bg-gray-100" />;
  }

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/returns" className="text-sm text-greeva-starbucks-green hover:underline">
          ← Kembali ke daftar retur
        </Link>
      </div>
      <PageHeader title={ret.return_number} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Detail pengajuan */}
          <div className="rounded-card bg-white p-6 shadow-card">
            <h2 className="mb-4 font-semibold text-greeva-black">Detail Pengajuan</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Pesanan</dt>
                <dd className="text-greeva-black">{ret.order_number}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Alasan</dt>
                <dd className="text-greeva-black">{RETURN_REASON_LABELS[ret.reason]}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Penjelasan</dt>
                <dd className="text-greeva-text-body">{ret.description}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Diajukan</dt>
                <dd className="text-greeva-black">
                  {new Date(ret.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </dd>
              </div>
            </dl>

            {/* Foto bukti */}
            {ret.photos.length > 0 && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="mb-2 text-sm font-medium text-greeva-black">Foto Bukti</p>
                <div className="flex flex-wrap gap-3">
                  {ret.photos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative h-24 w-24 overflow-hidden rounded-lg bg-greeva-mint-light">
                      <Image src={url} alt={`Bukti ${i + 1}`} fill sizes="96px" className="object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buyer */}
          {ret.buyer && (
            <div className="rounded-card bg-white p-6 shadow-card">
              <h2 className="mb-3 font-semibold text-greeva-black">Pembeli</h2>
              <p className="text-sm text-greeva-black">{ret.buyer.name}</p>
              <p className="text-xs text-gray-400">{ret.buyer.email}</p>
            </div>
          )}
        </div>

        {/* Panel aksi */}
        <div>
          <div className="rounded-card bg-greeva-sand-warm p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-greeva-black">Status</h2>
              <Badge variant={STATUS_BADGE[ret.status] ?? 'gray'}>{ret.status_label}</Badge>
            </div>

            {ret.admin_note && (
              <div className="mb-4 rounded-lg bg-white p-3 text-sm">
                <p className="text-xs font-medium text-gray-400">Catatan Admin</p>
                <p className="mt-1 text-greeva-black">{ret.admin_note}</p>
              </div>
            )}

            {ret.resolved_at && (
              <p className="mb-4 text-xs text-gray-400">
                Ditinjau {new Date(ret.resolved_at).toLocaleDateString('id-ID')}
                {ret.resolved_by ? ` oleh ${ret.resolved_by}` : ''}
              </p>
            )}

            {ret.status === 'pending' ? (
              <div className="space-y-2">
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="w-full rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50"
                >
                  {busy ? 'Memproses...' : 'Setujui & Refund'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={busy}
                  className="w-full rounded-pill border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Tolak Pengajuan
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Pengajuan ini sudah ditinjau.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
