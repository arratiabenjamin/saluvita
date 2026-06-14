import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/modules/auth/api/auth-api';

export function useForgotPassword() {
  const { mutate, mutateAsync, isPending, isSuccess, isError } = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });

  return { mutate, mutateAsync, isPending, isSuccess, isError };
}
