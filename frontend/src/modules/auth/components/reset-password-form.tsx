import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '@/modules/auth/hooks/useResetPassword';
import { routes } from '@/shared/constants/routes';
import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from '@/modules/auth/schemas/auth-schemas';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { mutate, isPending, isSuccess, isError } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <Card className="w-full max-w-lg p-6 sm:p-8 md:p-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
            Enlace inválido
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Enlace de recuperación incompleto
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-muted sm:text-base">
            El enlace que usaste no contiene un token válido. Por favor, solicitá un nuevo enlace.
          </p>
          <p className="mt-6">
            <Link
              to={routes.forgotPassword}
              className="font-semibold text-primary-dark hover:underline"
            >
              Solicitar nuevo enlace
            </Link>
          </p>
        </div>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-lg p-6 sm:p-8 md:p-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-dark">
            Contraseña actualizada
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            ¡Todo listo!
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-muted sm:text-base">
            Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión con tu nueva
            contraseña.
          </p>
          <p className="mt-6">
            <Link to={routes.login} className="font-semibold text-primary-dark hover:underline">
              Ir al inicio de sesión
            </Link>
          </p>
        </div>
      </Card>
    );
  }

  const onSubmit = (values: ResetPasswordFormValues) => {
    mutate({ token, password: values.password });
  };

  return (
    <Card className="w-full max-w-lg p-6 sm:p-8 md:p-10">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-dark">
          Nueva contraseña
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
          Restablecé tu contraseña
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-muted sm:text-base">
          Ingresá tu nueva contraseña. Debe tener al menos 8 caracteres, incluyendo mayúscula,
          minúscula, número y carácter especial.
        </p>
      </div>

      {isError ? (
        <div
          className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
          role="alert"
          aria-live="polite"
        >
          El enlace expiró o ya fue utilizado.{' '}
          <Link
            to={routes.forgotPassword}
            className="font-semibold underline hover:text-rose-800"
          >
            Solicitá uno nuevo
          </Link>
          .
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Repetí tu nueva contraseña"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth disabled={isPending} className="min-h-14 text-base">
          {isPending ? 'Actualizando...' : 'Actualizar contraseña'}
        </Button>
      </form>
    </Card>
  );
}
