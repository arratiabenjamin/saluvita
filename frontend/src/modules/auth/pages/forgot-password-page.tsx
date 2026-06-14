import { AuthLayout } from '@/shared/layouts/auth-layout';
import { ForgotPasswordForm } from '@/modules/auth/components/forgot-password-form';

export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
