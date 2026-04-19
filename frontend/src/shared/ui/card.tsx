import { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[32px] border border-slate-200/80 bg-surface shadow-[0_16px_36px_rgba(15,23,42,0.06)] backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
