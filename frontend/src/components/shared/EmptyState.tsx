import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionConfig {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ActionConfig;
  secondaryAction?: ActionConfig;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_TOKENS = {
  sm: {
    wrapper: 'py-10',
    icon: 'h-10 w-10 mb-3',
    title: 'text-base font-semibold',
    description: 'text-sm',
  },
  md: {
    wrapper: 'py-16',
    icon: 'h-14 w-14 mb-4',
    title: 'text-lg font-semibold',
    description: 'text-sm',
  },
  lg: {
    wrapper: 'py-20',
    icon: 'h-16 w-16 mb-5',
    title: 'text-xl font-bold',
    description: 'text-base',
  },
} as const;

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  const tokens = SIZE_TOKENS[size];

  return (
    <div className={cn('mx-auto max-w-sm text-center', tokens.wrapper, className)}>
      {Icon ? (
        <Icon className={cn('mx-auto text-gray-200', tokens.icon)} aria-hidden="true" />
      ) : null}
      <p className={cn('text-greeva-black', tokens.title)}>{title}</p>
      {description ? (
        <p className={cn('mt-1.5 text-gray-500', tokens.description)}>{description}</p>
      ) : null}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action ? <PrimaryAction {...action} /> : null}
          {secondaryAction ? <SecondaryAction {...secondaryAction} /> : null}
        </div>
      )}
    </div>
  );
}

function PrimaryAction({ label, href, onClick }: ActionConfig) {
  const classes =
    'inline-flex items-center justify-center rounded-pill bg-greeva-forest px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-greeva-starbucks-green hover:scale-[1.02]';
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {label}
    </button>
  );
}

function SecondaryAction({ label, href, onClick }: ActionConfig) {
  const classes = 'text-sm font-medium text-greeva-starbucks-green hover:underline';
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {label}
    </button>
  );
}
