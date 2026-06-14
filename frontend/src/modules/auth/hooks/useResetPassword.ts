import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/modules/auth/api/auth-api';

interface ResetPasswordPayload {
  token: string;
  password: string;
}

export function useResetPassword() {
  const { mutate, mutateAsync, isPending, isSuccess, isError } = useMutation({
    mutationFn: ({ token, password }: ResetPasswordPayload) =>
      authApi.resetPassword(token, password),
  });

  return { mutate, mutateAsync, isPending, isSuccess, isError };
}
