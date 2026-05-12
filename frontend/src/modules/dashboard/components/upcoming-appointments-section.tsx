import { Card } from '@/shared/ui/card';

const appointments = [
  {
    doctor: 'Dra. Paula Rios',
    specialty: 'Medicina Interna',
    date: 'Lunes 24 Jun · 09:30',
    status: 'Confirmada',
    statusTone: 'bg-emerald-50 text-emerald-600',
    iconTone: 'bg-blue-100 text-blue-600',
  },
  {
    doctor: 'Dr. Tomas Herrera',
    specialty: 'Cardiologia',
    date: 'Miercoles 26 Jun · 11:00',
    status: 'Pendiente',
    statusTone: 'bg-amber-50 text-amber-600',
    iconTone: 'bg-rose-100 text-rose-500',
  },
  {
    doctor: 'Dra. Camila Soto',
    specialty: 'Neurologia',
    date: 'Viernes 28 Jun · 16:15',
    status: 'Confirmada',
    statusTone: 'bg-emerald-50 text-emerald-600',
    iconTone: 'bg-violet-100 text-violet-600',
  },
] as const;

const liveIconTones = [
  'bg-blue-100 text-blue-600',
  'bg-rose-100 text-rose-500',
  'bg-violet-100 text-violet-600',
] as const;

export type UpcomingAppointment = {
  id: string;
  startsAt: string;
  status: string;
  doctorName: string | null;
  specialty: string | null;
};

type UpcomingAppointmentsSectionProps = {
  appointments?: UpcomingAppointment[];
  isLoading?: boolean;
  isEmpty?: boolean;
};

function formatLiveAppointmentDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const weekday = new Intl.DateTimeFormat('es-CL', { weekday: 'long' }).format(d);
  const time = new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${label} · ${time}`;
}

function liveStatusPresentation(status: string) {
  if (status === 'COMPLETED') {
    return { label: 'Completada', tone: 'bg-emerald-50 text-emerald-600' as const };
  }
  if (status === 'CANCELLED') {
    return { label: 'Cancelada', tone: 'bg-slate-100 text-slate-600' as const };
  }
  return { label: 'Pendiente', tone: 'bg-amber-50 text-amber-600' as const };
}

export function UpcomingAppointmentsSection({
  appointments: liveAppointments,
  isLoading,
  isEmpty,
}: UpcomingAppointmentsSectionProps = {}) {
  const isControlled = typeof isLoading === 'boolean';

  if (!isControlled) {
    return (
      <Card className="border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">Proximas citas</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-main">
              Tu agenda cercana
            </h2>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            3 programadas
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {appointments.map((appointment) => (
            <div
              key={`${appointment.doctor}-${appointment.date}`}
              className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${appointment.iconTone}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M12 14v7M8.5 17.5h7" />
                    <path d="M10 3h4l1 4H9z" />
                    <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
                    <circle cx="12" cy="9" r="3" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-text-main">
                        {appointment.doctor}
                      </p>
                      <p className="mt-1 text-sm text-text-muted">
                        {appointment.specialty}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${appointment.statusTone}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                    >
                      <path d="M8 2v4M16 2v4M3 10h18" />
                      <rect x="3" y="4" width="18" height="17" rx="3" />
                    </svg>
                    <span>{appointment.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const rows = liveAppointments ?? [];

  return (
    <Card className="border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Proximas citas</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-main">
            Tu agenda cercana
          </h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          {isLoading ? 'Cargando' : isEmpty ? 'Sin citas' : `${rows.length} programadas`}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-text-muted">Cargando dashboard...</p>
        ) : isEmpty ? (
          <p className="text-sm text-text-muted">Sin citas proximas.</p>
        ) : (
          rows.map((appointment, index) => {
            const { label: statusLabel, tone: statusTone } = liveStatusPresentation(appointment.status);
            const iconTone = liveIconTones[index % liveIconTones.length];
            const doctor = appointment.doctorName?.trim() || 'Sin medico informado';
            const specialty = appointment.specialty?.trim() || 'Sin especialidad informada';
            const dateLabel = formatLiveAppointmentDate(appointment.startsAt);

            return (
              <div
                key={appointment.id}
                className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconTone}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path d="M12 14v7M8.5 17.5h7" />
                      <path d="M10 3h4l1 4H9z" />
                      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
                      <circle cx="12" cy="9" r="3" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-text-main">{doctor}</p>
                        <p className="mt-1 text-sm text-text-muted">{specialty}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                      >
                        <path d="M8 2v4M16 2v4M3 10h18" />
                        <rect x="3" y="4" width="18" height="17" rx="3" />
                      </svg>
                      <span>{dateLabel || 'Sin fecha'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
