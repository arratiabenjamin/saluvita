import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { AppShell } from '@/shared/layouts/app-shell';

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-surface p-8 text-center shadow-[0_18px_40px_rgba(36,67,74,0.06)]">
          <p className="text-lg font-semibold text-text-main">
            Cargando tu espacio clinico...
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Estamos preparando la informacion principal.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
