import { useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { Button } from '@/shared/ui/button';

type TopbarProps = {
  onMenuClick: () => void;
};

const titles: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Resumen general',
    description: 'Una vista simple para empezar el dia con claridad.',
  },
  '/patients': {
    title: 'Pacientes',
    description: 'Consulta y organiza perfiles clinicos personales y familiares.',
  },
  '/patients/new': {
    title: 'Nuevo paciente',
    description: 'Carga datos basicos de forma simple y guiada.',
  },
  '/appointments': {
    title: 'Citas',
    description: 'Preparamos el espacio base para gestionar agenda y estados.',
  },
  '/professionals': {
    title: 'Profesionales',
    description: 'Consulta doctores, especialidades y centros de atencion en un mismo lugar.',
  },
  '/facilities': {
    title: 'Centros',
    description: 'La informacion de centros ahora vive integrada en Profesionales.',
  },
  '/schedules': {
    title: 'Mi agenda de salud',
    description: 'Organiza tus citas, recordatorios y actividades del dia.',
  },
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { session, logout } = useAuth();
  const header = titles[location.pathname] ?? titles['/dashboard'];

  return (
    <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-sm lg:hidden"
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="rounded-[26px] bg-white px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80">
            <p className="text-sm font-semibold text-blue-600">{header.title}</p>
            <p className="mt-1 text-sm text-text-muted">{header.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[26px] bg-white px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 sm:justify-start">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600">
            {session?.user?.firstName?.charAt(0) ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-main">
              {session?.user
                ? `${session.user.firstName} ${session.user.lastName}`
                : 'Usuario'}
            </p>
            <p className="truncate text-xs text-text-muted">
              {session?.user?.email ?? 'Sin correo'}
            </p>
          </div>
          <Button variant="ghost" className="border-white bg-background px-4" onClick={() => void logout()}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
