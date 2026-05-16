import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { authApi } from '@/modules/auth/api/auth-api';
import { AuthLayout } from '@/shared/layouts/auth-layout';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { routes } from '@/shared/constants/routes';

const DOCUMENT_TYPES = [
  { value: 'RUT', label: 'RUT (Chile)' },
  { value: 'DNI', label: 'DNI' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'CEDULA', label: 'Cédula' },
] as const;

const registerSchema = z.object({
  firstName: z.string().min(1, 'Ingresa tu nombre'),
  lastName: z.string().min(1, 'Ingresa tu apellido'),
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  documentType: z.enum(['RUT', 'DNI', 'PASSPORT', 'CEDULA']),
  documentNumber: z.string().min(1, 'Ingresa tu número de documento'),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { isAuthenticated, isInitializing, login } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { documentType: 'RUT' },
  });

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setSubmitError(null);
      await authApi.register({
        ...values,
        birthDate: values.birthDate || undefined,
        phone: values.phone || undefined,
      });
      await login({ email: values.email, password: values.password });
      navigate(routes.dashboard, { replace: true });
    } catch {
      setSubmitError('No pudimos crear tu cuenta. Verificá que los datos sean correctos e intentá nuevamente.');
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-lg p-6 sm:p-8 md:p-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-dark">
            Crear cuenta
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Registrate en la plataforma
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-muted sm:text-base">
            Completá tus datos para crear tu cuenta y acceder a tu agenda médica.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              type="text"
              autoComplete="given-name"
              placeholder="Juan"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Apellido"
              type="text"
              autoComplete="family-name"
              placeholder="Pérez"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-text-main">Tipo de documento</span>
              <select
                className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('documentType')}
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
              {errors.documentType && (
                <p className="mt-1 text-xs text-rose-600">{errors.documentType.message}</p>
              )}
            </label>

            <Input
              label="Número de documento"
              type="text"
              placeholder="12.345.678-9"
              error={errors.documentNumber?.message}
              {...register('documentNumber')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de nacimiento (opcional)"
              type="date"
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />
            <Input
              label="Teléfono (opcional)"
              type="tel"
              autoComplete="tel"
              placeholder="+56 9 1234 5678"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

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
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>

          <p className="text-center text-sm leading-6 text-text-muted">
            ¿Ya tenés una cuenta?{' '}
            <Link to={routes.login} className="font-semibold text-primary-dark hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}
