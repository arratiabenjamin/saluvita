import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/modules/auth/components/login-form';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { AuthLayout } from '@/shared/layouts/auth-layout';
import { routes } from '@/shared/constants/routes';

export function LoginPage() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
