import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export function NewAppointmentSection() {
  return (
    <Card className="border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Nueva cita</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-main">
            Agenda una atencion
          </h2>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="M8 2v4M16 2v4M3 10h18" />
            <rect x="3" y="4" width="18" height="17" rx="3" />
            <path d="M12 11v6M9 14h6" />
          </svg>
        </span>
      </div>

      <form className="mt-6 space-y-4">
        <Input label="Lugar" placeholder="Ej. Clinica Central" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Fecha" type="date" />
          <Input label="Hora" type="time" />
        </div>
        <Button fullWidth className="min-h-14 text-base">
          Reservar nueva cita
        </Button>
      </form>
    </Card>
  );
}
