import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '@/modules/patients/hooks/use-patients';
import { PatientFilters } from '@/modules/patients/components/patient-filters';
import { PatientTable } from '@/modules/patients/components/patient-table';
import { EmptyState } from '@/shared/components/empty-state';
import { PageHeader } from '@/shared/components/page-header';
import { routes } from '@/shared/constants/routes';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

export function PatientsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = usePatients({ search });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description="Gestiona perfiles clinicos personales y familiares desde un listado simple y facil de recorrer."
        action={
          <Link to={routes.newPatient}>
            <Button>Nuevo paciente</Button>
          </Link>
        }
      />

      <PatientFilters search={search} onSearchChange={setSearch} />

      {isLoading ? (
        <Card className="p-8">
          <p className="text-lg font-semibold text-text-main">
            Cargando pacientes...
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Estamos preparando el listado para ti.
          </p>
        </Card>
      ) : null}

      {isError ? (
        <EmptyState
          title="No pudimos cargar los pacientes"
          description="La base ya contempla estados de error para mantener una experiencia clara mientras conectamos los endpoints reales."
        />
      ) : null}

      {!isLoading && !isError && data?.data.length === 0 ? (
        <EmptyState
          title="Aun no hay pacientes que coincidan"
          description="Prueba con otra busqueda o crea un nuevo perfil para comenzar."
          action={
            <Link to={routes.newPatient}>
              <Button>Crear primer paciente</Button>
            </Link>
          }
        />
      ) : null}

      {!isLoading && !isError && data?.data.length ? (
        <PatientTable patients={data.data} />
      ) : null}
    </div>
  );
}
