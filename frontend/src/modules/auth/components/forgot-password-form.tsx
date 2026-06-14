import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '@/modules/auth/hooks/useForgotPassword';
import { routes } from '@/shared/constants/routes';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { mutate, isPending, isSuccess, isError } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    mutate(values.email);
  };

  // Anti-enumeration: show the generic success state regardless of the server
  // response (success OR error) so an observer cannot tell whether the email exists.
  if (isSuccess || isError) {
    return (
      <Card className="w-full max-w-lg p-6 sm:p-8 md:p-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-dark">
            Correo enviado
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Revisá tu bandeja de entrada
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-muted sm:text-base">
            Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña.
            El enlace expira en 1 hora y es de un solo uso.
          </p>
          <p className="mt-6">
            <Link to={routes.login} className="font-semibold text-primary-dark hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg p-6 sm:p-8 md:p-10">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-dark">
          Recuperar contraseña
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-muted sm:text-base">
          Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" fullWidth disabled={isPending} className="min-h-14 text-base">
          {isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </Button>

        <p className="text-center text-sm leading-6 text-text-muted">
          <Link to={routes.login} className="font-semibold text-primary-dark hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </Card>
  );
}
