import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="block">
        {label ? (
          <span className="mb-2 block text-sm font-semibold text-text-main">
            {label}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-text-main outline-none transition focus:border-primary-dark focus:ring-4 focus:ring-primary/15',
            error &&
              'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
            className,
          )}
          {...props}
        />
        {error ? (
          <span className="mt-2 block text-sm text-rose-500">{error}</span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = 'Input';
