'use client';

import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-pill font-semibold transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greeva-leaf focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          size === 'sm' && 'px-5 py-2 text-sm',
          size === 'md' && 'px-8 py-3.5 text-base',
          size === 'lg' && 'px-10 py-4 text-lg',
          variant === 'primary' &&
            'bg-greeva-forest text-white hover:bg-greeva-starbucks-green hover:scale-[1.02] active:scale-100',
          variant === 'secondary' &&
            'border-[1.5px] border-greeva-forest-dark bg-transparent text-greeva-forest-dark hover:bg-greeva-mint-light',
          variant === 'ghost' && 'text-greeva-starbucks-green hover:bg-greeva-mint-light',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
