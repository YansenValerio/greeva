interface PriceProps {
  cents: number;
  className?: string;
}

export function Price({ cents, className }: PriceProps) {
  const formatted = (cents / 100).toLocaleString('id-ID');
  return <span className={className}>Rp {formatted}</span>;
}
