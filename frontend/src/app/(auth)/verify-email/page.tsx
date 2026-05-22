'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '@/lib/api/auth';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    const hash = searchParams.get('hash');
    const expires = searchParams.get('expires');
    const signature = searchParams.get('signature');

    if (!id || !hash || !expires || !signature) {
      setStatus('error');
      setMessage('Tautan verifikasi tidak lengkap. Mohon klik tautan dari email lagi.');
      return;
    }

    verifyEmail({
      id: Number(id),
      hash,
      expires: Number(expires),
      signature,
    })
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((e) => {
        setStatus('error');
        const msg = e?.response?.data?.message ?? 'Verifikasi gagal.';
        setMessage(msg);
      });
  }, [searchParams]);

  return (
    <div className="text-center">
      {status === 'verifying' && (
        <>
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-greeva-forest" />
          <h1 className="mb-2 text-2xl font-bold text-greeva-black">Memverifikasi email...</h1>
          <p className="text-sm text-gray-600">Mohon tunggu sebentar.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold text-greeva-black">Email terverifikasi! 🎉</h1>
          <p className="mb-8 text-sm text-gray-600">{message}</p>
          <Link
            href="/login"
            className="block w-full rounded-pill bg-greeva-forest py-3 text-center text-base font-semibold text-white hover:bg-greeva-starbucks-green transition-colors"
          >
            Masuk ke Akun
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-greeva-black">Verifikasi gagal</h1>
          <p className="mb-8 text-sm text-gray-600">{message}</p>
          <Link
            href="/account"
            className="block w-full rounded-pill border border-greeva-forest py-3 text-center text-base font-semibold text-greeva-forest hover:bg-greeva-mint-light transition-colors"
          >
            Kirim Ulang Email Verifikasi
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded bg-gray-100" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
