import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  patientFormSchema,
  PatientFormValues,
} from '@/modules/patients/schemas/patient-form-schema';
import { useCreatePatient } from '@/modules/patients/hooks/use-patients';
import { routes } from '@/shared/constants/routes';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export function PatientForm() {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      document: '',
      email: '',
      phone: '',
      relationshipLabel: '',
      birthDate: '',
    },
  });

  const onSubmit = async (values: PatientFormValues) => {
    await createPatient.mutateAsync(values);
    navigate(routes.patients);
  };

  return (
    <Card className="p-6 sm:p-8">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Nombre"
            placeholder="Ej. Elena"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Apellido"
            placeholder="Ej. Rojas"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Documento"
            placeholder="RUT, DNI o pasaporte"
            error={errors.document?.message}
            {...register('document')}
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Correo electronico"
            type="email"
            placeholder="paciente@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Telefono"
            placeholder="+56 9 1234 5678"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>
        <Input
          label="Relacion con el titular"
          placeholder="Ej. Titular, madre, hijo"
          error={errors.relationshipLabel?.message}
          {...register('relationshipLabel')}
        />

        {createPatient.isError ? (
          <div className="rounded-3xl bg-[rgba(232,137,137,0.12)] px-4 py-3 text-sm text-danger">
            No pudimos guardar el paciente. Intenta nuevamente.
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(routes.patients)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createPatient.isPending}>
            {createPatient.isPending ? 'Guardando...' : 'Crear paciente'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
