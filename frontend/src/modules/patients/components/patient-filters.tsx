import { ChangeEvent } from 'react';
import { Input } from '@/shared/ui/input';

type PatientFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function PatientFilters({
  search,
  onSearchChange,
}: PatientFiltersProps) {
  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          label="Buscar paciente"
          placeholder="Nombre, apellido, documento o correo"
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onSearchChange(event.target.value)
          }
        />
        <div className="rounded-[24px] bg-background px-4 py-4">
          <p className="text-sm font-semibold text-text-main">Filtros basicos</p>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Dejamos una base simple para crecer luego con estado, centro y
            profesional asociado.
          </p>
        </div>
      </div>
    </div>
  );
}
