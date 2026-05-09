import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-input border-[1.5px] border-gray-200 px-4 py-3 text-base text-greeva-text-body transition-colors placeholder:text-gray-400',
        'focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/40',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
