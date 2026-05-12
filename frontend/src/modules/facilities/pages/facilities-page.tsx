import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
import { routes } from '@/shared/constants/routes';

export function FacilitiesPage() {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <Card className="border-slate-200 bg-white p-8 shadow-[0_16px_32px_rgba(15,23,42,0.05)] sm:p-10">
        <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          Informacion integrada
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-text-main">Centros</h1>
        <p className="mt-4 text-base leading-8 text-text-muted">
          La informacion de centros ahora esta integrada en Profesionales para que cada doctor o
          equipo muestre directamente donde atiende.
        </p>
        <div className="mt-8">
          <Link to={routes.professionals}>
            <Button>Ir a Profesionales</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
