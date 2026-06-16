import { AuthLayout } from '@/shared/layouts/auth-layout';
import { ResetPasswordForm } from '@/modules/auth/components/reset-password-form';

export function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
