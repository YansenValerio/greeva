import { Star } from 'lucide-react';

interface StarRatingProps {
  /** Rating value 0–5, can be fractional for display */
  value: number;
  /** Pixel size of each star (default 16) */
  size?: number;
  /** Show numeric value next to stars */
  showValue?: boolean;
  className?: string;
}

export function StarRating({ value, size = 16, showValue = false, className = '' }: StarRatingProps) {
  const rounded = Math.round(value * 2) / 2; // nearest half
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`Rating ${value} dari 5`}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rounded >= i;
          const half = !filled && rounded >= i - 0.5;
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="absolute inset-0 text-gray-200"
                strokeWidth={1.5}
                fill="currentColor"
              />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden text-amber-400"
                  style={{ width: half ? size / 2 : size }}
                >
                  <Star size={size} strokeWidth={1.5} fill="currentColor" />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="text-sm font-medium text-gray-600">{value.toFixed(1)}</span>
      )}
    </span>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, size = 28, disabled }: StarRatingInputProps) {
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = value >= i;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} bintang`}
            disabled={disabled}
            onClick={() => onChange(i)}
            className={`rounded p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-greeva-leaf ${
              active ? 'text-amber-400' : 'text-gray-200'
            }`}
          >
            <Star size={size} strokeWidth={1.5} fill="currentColor" />
          </button>
        );
      })}
    </div>
  );
}
