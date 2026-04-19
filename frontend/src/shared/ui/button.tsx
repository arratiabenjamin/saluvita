import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-[0_14px_30px_rgba(79,169,157,0.24)] hover:bg-primary-dark',
  secondary:
    'bg-primary/12 text-primary-dark hover:bg-primary/18',
  ghost: 'border border-slate-200 bg-white text-text-main hover:bg-background',
  danger: 'bg-rose-400 text-white hover:bg-rose-500',
};

export function Button({
  children,
  className,
  variant = 'primary',
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
