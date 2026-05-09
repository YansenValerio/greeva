import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'green', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-[10px] py-1 text-caption tracking-[0.08em] uppercase',
        variant === 'green' && 'bg-greeva-mint-light text-greeva-forest-dark',
        variant === 'amber' && 'bg-amber-100 text-amber-800',
        variant === 'gray' && 'bg-gray-100 text-gray-600',
        className,
      )}
    >
      {children}
    </span>
  );
}
