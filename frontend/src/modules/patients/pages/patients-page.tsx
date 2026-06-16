import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePatients } from '@/modules/patients/hooks/use-patients';
import { PatientFilters } from '@/modules/patients/components/patient-filters';
import { PatientTable } from '@/modules/patients/components/patient-table';
import { EmptyState } from '@/shared/components/empty-state';
import { PageHeader } from '@/shared/components/page-header';
import { routes } from '@/shared/constants/routes';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Pagination } from '@/shared/ui/pagination';

export function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const { data, meta, isLoading, isFetching, isError } = usePatients({ search, page });
  const patients = Array.isArray(data?.data) ? data.data : [];
  const totalPages = meta?.totalPages ?? 1;

  // Clamp out-of-range page (e.g. URL has page=99 but totalPages=3)
  useEffect(() => {
    if (meta && meta.totalPages >= 1 && page > meta.totalPages) {
      setSearchParams(
        (prev) => {
          prev.set('page', String(meta.totalPages));
          return prev;
        },
        { replace: true },
      );
    }
  }, [page, meta, setSearchParams]);

  function handleSearchChange(value: string) {
    setSearchParams(
      (prev) => {
        prev.set('q', value);
        prev.set('page', '1');
        return prev;
      },
      { replace: true },
    );
  }

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      prev.set('page', String(newPage));
      return prev;
    });
  }

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

      <PatientFilters search={search} onSearchChange={handleSearchChange} />

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

      {!isLoading && !isError && patients.length === 0 ? (
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

      {!isLoading && !isError && patients.length ? (
        <PatientTable patients={patients} />
      ) : null}

      {!isError ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={isFetching}
          className="py-2"
        />
      ) : null}
    </div>
  );
}
