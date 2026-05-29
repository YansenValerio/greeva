'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { adminDownloadReport, type ReportType } from '@/lib/api/admin';
import { toast } from '@/lib/feedback';

interface ReportCard {
  type: ReportType;
  title: string;
  description: string;
}

const REPORTS: ReportCard[] = [
  {
    type: 'sales',
    title: 'Laporan Penjualan',
    description: 'Seluruh pesanan beserta subtotal, ongkir, diskon, dan total dalam rentang tanggal.',
  },
  {
    type: 'earnings',
    title: 'Earning Mitra',
    description: 'Rincian bagi hasil per mitra: produk, jumlah, status, dan tanggal pembayaran.',
  },
  {
    type: 'payouts',
    title: 'Rekap Payout',
    description: 'Ringkasan batch payout: periode, jumlah earning, total, status, dan tanggal transfer.',
  },
];

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [downloading, setDownloading] = useState<ReportType | null>(null);

  async function handleDownload(type: ReportType) {
    if (from && to && from > to) {
      toast.error('Tanggal "dari" tidak boleh setelah tanggal "sampai".');
      return;
    }
    setDownloading(type);
    try {
      await adminDownloadReport(type, { from, to });
      toast.success('Laporan berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh laporan. Coba lagi.');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <PageHeader title="Laporan" />

      {/* Rentang tanggal */}
      <div className="mb-6 rounded-card bg-greeva-sand-warm p-5">
        <p className="mb-3 text-sm font-semibold text-greeva-black">Rentang Tanggal</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Dari</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Sampai</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-greeva-forest focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400">Default: 30 hari terakhir. Format unduhan: CSV (Excel-ready).</p>
        </div>
      </div>

      {/* Daftar laporan */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {REPORTS.map((r) => (
          <div key={r.type} className="flex flex-col rounded-card bg-white p-6 shadow-card">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-greeva-mint-light">
              <FileSpreadsheet className="h-5 w-5 text-greeva-forest-dark" />
            </div>
            <h3 className="font-semibold text-greeva-black">{r.title}</h3>
            <p className="mt-1 flex-1 text-sm text-gray-500">{r.description}</p>
            <button
              onClick={() => handleDownload(r.type)}
              disabled={downloading !== null}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-pill bg-greeva-forest py-2.5 text-sm font-semibold text-white hover:bg-greeva-starbucks-green disabled:opacity-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              {downloading === r.type ? 'Menyiapkan...' : 'Unduh CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
