import { NavigationIconName } from '@/shared/layouts/navigation-items';

type NavigationIconProps = {
  name: NavigationIconName;
  className?: string;
};

export function NavigationIcon({ name, className }: NavigationIconProps) {
  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M4 13.5h7V20H4zM13 4h7v7h-7zM13 13.5h7V20h-7zM4 4h7v7H4z" />
      </svg>
    );
  }

  if (name === 'patients') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M20 8v6M17 11h6" />
      </svg>
    );
  }

  if (name === 'appointments') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    );
  }

  if (name === 'professionals') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M12 14v7M8.5 17.5h7" />
        <path d="M10 3h4l1 4H9z" />
        <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
        <circle cx="12" cy="9" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
