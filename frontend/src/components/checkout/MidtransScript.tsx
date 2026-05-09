import Script from 'next/script';

export function MidtransScript() {
  const isProduction = process.env.NODE_ENV === 'production';
  const src = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  return (
    <Script
      src={src}
      data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''}
      strategy="lazyOnload"
    />
  );
}
