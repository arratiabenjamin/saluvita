import { NavLink } from 'react-router-dom';
import { NavigationIcon } from '@/shared/layouts/navigation-icon';
import { appNavigation } from '@/shared/layouts/navigation-items';
import { cn } from '@/shared/lib/cn';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const iconColorByRoute: Record<string, string> = {
    '/dashboard': 'text-blue-main bg-blue-100',
    '/patients': 'text-sky-600 bg-sky-100',
    '/appointments': 'text-emerald-600 bg-emerald-100',
    '/professionals': 'text-violet-600 bg-violet-100',
    '/schedules': 'text-rose-500 bg-rose-100',
    '/reminders': 'text-amber-600 bg-amber-100',
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-text-main/30 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-[18px_0_40px_rgba(15,23,42,0.04)] transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(145deg,rgba(59,130,246,0.08),rgba(255,255,255,1))] p-4 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-100/60 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-13 w-13 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600 shadow-sm">
              <span className="text-lg font-extrabold">B</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
                Agenda Medica
              </p>
              <p className="mt-1 text-lg font-bold text-text-main">BMB Salud</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-text-muted">
            Un espacio cercano para gestionar salud personal y familiar con calma.
          </p>
        </div>

        <div className="mt-6">
          <p className="px-3 text-xs font-bold uppercase tracking-[0.22em] text-text-muted/80">
            Navegacion
          </p>
          <nav className="mt-3 space-y-2">
            {appNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-[22px] px-4 py-3.5 text-sm font-semibold transition',
                    isActive
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-[0_12px_24px_rgba(59,130,246,0.12)]'
                      : 'text-text-muted hover:bg-slate-50 hover:text-text-main hover:shadow-[0_10px_22px_rgba(15,23,42,0.04)]',
                  )
                }
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm transition',
                    isOpen ? '' : '',
                    iconColorByRoute[item.to] ?? 'bg-slate-100 text-slate-600',
                  )}
                >
                  <NavigationIcon name={item.icon} className="h-5 w-5 shrink-0" />
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-5 shadow-[0_16px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Accesible
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              Amable
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-text-main">Espacio claro</p>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Navegacion simple y comoda para pacientes, cuidadores y adultos
            mayores.
          </p>
        </div>
      </aside>
    </>
  );
}
