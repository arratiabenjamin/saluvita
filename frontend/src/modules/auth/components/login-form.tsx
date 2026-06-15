import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { routes } from '@/shared/constants/routes';
import { loginSchema, LoginFormValues } from '@/modules/auth/schemas/auth-schemas';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@bmbsalud.cl',
      password: '123456',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitError(null);
      await login(values);

      const nextPath =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? routes.dashboard;
      navigate(nextPath, { replace: true });
    } catch {
      setSubmitError('No pudimos iniciar sesion. Revisa tus datos e intenta nuevamente.');
    }
  };

  return (
    <Card className="w-full max-w-lg p-6 sm:p-8 md:p-10">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-dark">
          Iniciar sesion
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
          Accede a tu espacio clinico
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-muted sm:text-base">
          Ingresa con tu correo y contraseña para continuar de forma segura.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Correo electronico"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          error={errors.password?.message}
          {...register('password')}
        />

        {submitError ? (
          <div
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
            role="alert"
            aria-live="polite"
          >
            {submitError}
          </div>
        ) : null}

        <Button type="submit" fullWidth disabled={isSubmitting} className="min-h-14 text-base">
          {isSubmitting ? 'Ingresando...' : 'Ingresar a la plataforma'}
        </Button>

        <div className="rounded-2xl bg-background px-4 py-4 text-center">
          <p className="text-sm leading-6 text-text-muted">
            Demo MVP: usa <span className="font-semibold text-text-main">demo@bmbsalud.cl</span> y{' '}
            <span className="font-semibold text-text-main">123456</span>.
          </p>
        </div>

        <p className="text-center text-sm leading-6 text-text-muted">
          <Link
            to={routes.forgotPassword}
            className="font-semibold text-primary-dark hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="text-center text-sm leading-6 text-text-muted">
          ¿No tenés cuenta aún?{' '}
          <Link to={routes.register} className="font-semibold text-primary-dark hover:underline">
            Registrate gratis
          </Link>
        </p>
      </form>
    </Card>
  );
}
