import { cn } from '@/shared/lib/cn';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

function buildPageWindow(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];

  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) {
    pages.push('ellipsis');
  }

  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  if (windowEnd < totalPages - 1) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isPrevDisabled = currentPage <= 1 || disabled;
  const isNextDisabled = currentPage >= totalPages || disabled;

  const pageWindow = buildPageWindow(currentPage, totalPages);

  function handlePrev() {
    if (!isPrevDisabled) {
      onPageChange(Math.max(1, currentPage - 1));
    }
  }

  function handleNext() {
    if (!isNextDisabled) {
      onPageChange(Math.min(totalPages, currentPage + 1));
    }
  }

  return (
    <nav
      aria-label="Pagination navigation"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <button
        type="button"
        onClick={handlePrev}
        disabled={isPrevDisabled}
        aria-label="Previous page"
        aria-disabled={isPrevDisabled}
        className={cn(
          'inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-40',
          isPrevDisabled
            ? 'border-slate-200 bg-white text-text-muted'
            : 'border-slate-200 bg-white text-text-main hover:bg-background',
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {pageWindow.map((item, index) => {
        if (item === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex min-h-9 min-w-9 items-center justify-center text-sm text-text-muted"
              aria-hidden="true"
            >
              …
            </span>
          );
        }

        const isActive = item === currentPage;

        return (
          <button
            key={item}
            type="button"
            onClick={() => !disabled && onPageChange(item)}
            disabled={disabled}
            aria-label={`Page ${item}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
              'disabled:cursor-not-allowed',
              isActive
                ? 'bg-primary text-white shadow-[0_6px_16px_rgba(79,169,157,0.3)]'
                : 'border border-slate-200 bg-white text-text-main hover:bg-background disabled:opacity-60',
            )}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleNext}
        disabled={isNextDisabled}
        aria-label="Next page"
        aria-disabled={isNextDisabled}
        className={cn(
          'inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-40',
          isNextDisabled
            ? 'border-slate-200 bg-white text-text-muted'
            : 'border-slate-200 bg-white text-text-main hover:bg-background',
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}
