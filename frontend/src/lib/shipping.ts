/** Daftar kurir umum di Indonesia (lowercase keys untuk matching). */
export const COURIERS: { value: string; label: string; trackUrl?: (tn: string) => string }[] = [
  { value: 'JNE',     label: 'JNE',     trackUrl: (tn) => `https://www.jne.co.id/tracking-package?awb=${encodeURIComponent(tn)}` },
  { value: 'JNT',     label: 'J&T Express', trackUrl: (tn) => `https://www.jet.co.id/track?awb=${encodeURIComponent(tn)}` },
  { value: 'SiCepat', label: 'SiCepat', trackUrl: (tn) => `https://www.sicepat.com/checkAwb?awb=${encodeURIComponent(tn)}` },
  { value: 'POS',     label: 'POS Indonesia', trackUrl: (tn) => `https://www.posindonesia.co.id/id/tracking/${encodeURIComponent(tn)}` },
  { value: 'AnterAja',label: 'AnterAja', trackUrl: (tn) => `https://anteraja.id/tracking?awb=${encodeURIComponent(tn)}` },
  { value: 'Ninja',   label: 'Ninja Xpress', trackUrl: (tn) => `https://www.ninjaxpress.co/en-id/tracking?id=${encodeURIComponent(tn)}` },
  { value: 'Other',   label: 'Lainnya' },
];

export function getCourierTrackUrl(courier: string | null, tracking: string | null): string | null {
  if (!courier || !tracking) return null;
  const entry = COURIERS.find((c) => c.value.toLowerCase() === courier.toLowerCase());
  return entry?.trackUrl ? entry.trackUrl(tracking) : null;
}
