import { ReactNode } from 'react';

export type ScheduleTab = 'today' | 'week' | 'upcoming';
export type ActivityType =
  | 'cita'
  | 'medicamento'
  | 'examen'
  | 'recordatorio'
  | 'seguimiento';
export type ActivityStatus =
  | 'confirmada'
  | 'pendiente'
  | 'completada'
  | 'cancelada';

export type HealthEvent = {
  id: string;
  tab: ScheduleTab;
  dayLabel: string;
  dateOrder: number;
  time: string;
  title: string;
  location: string;
  type: ActivityType;
  status: ActivityStatus;
  actionLabel: string;
};

export type PreparationItem = {
  id: string;
  title: string;
  helper: string;
};

export type QuickAction = {
  id: string;
  label: string;
  helper: string;
};

export const tabs: Array<{ id: ScheduleTab; label: string }> = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'upcoming', label: 'Proximas' },
];

export const healthEvents: HealthEvent[] = [
  {
    id: '1',
    tab: 'today',
    dayLabel: 'Hoy',
    dateOrder: 1,
    time: '08:00',
    title: 'Tomar medicacion de la manana',
    location: 'En casa',
    type: 'medicamento',
    status: 'pendiente',
    actionLabel: 'Marcar tomado',
  },
  {
    id: '2',
    tab: 'today',
    dayLabel: 'Hoy',
    dateOrder: 1,
    time: '10:30',
    title: 'Control de cardiologia',
    location: 'Clinica Central · Piso 2',
    type: 'cita',
    status: 'confirmada',
    actionLabel: 'Ver detalle',
  },
  {
    id: '3',
    tab: 'today',
    dayLabel: 'Hoy',
    dateOrder: 1,
    time: '16:00',
    title: 'Recordatorio de hidratacion',
    location: 'Rutina diaria',
    type: 'recordatorio',
    status: 'pendiente',
    actionLabel: 'Posponer',
  },
  {
    id: '4',
    tab: 'today',
    dayLabel: 'Hoy',
    dateOrder: 1,
    time: '18:30',
    title: 'Revisar indicaciones del examen',
    location: 'Portal de salud',
    type: 'examen',
    status: 'pendiente',
    actionLabel: 'Ver indicacion',
  },
  {
    id: '5',
    tab: 'week',
    dayLabel: 'Lunes',
    dateOrder: 1,
    time: '08:00',
    title: 'Tomar medicacion de la manana',
    location: 'En casa',
    type: 'medicamento',
    status: 'pendiente',
    actionLabel: 'Marcar tomado',
  },
  {
    id: '6',
    tab: 'week',
    dayLabel: 'Martes',
    dateOrder: 2,
    time: '10:30',
    title: 'Control de cardiologia',
    location: 'Clinica Central · Piso 2',
    type: 'cita',
    status: 'confirmada',
    actionLabel: 'Ver detalle',
  },
  {
    id: '7',
    tab: 'week',
    dayLabel: 'Miercoles',
    dateOrder: 3,
    time: '09:00',
    title: 'Examen de sangre',
    location: 'Laboratorio Vida',
    type: 'examen',
    status: 'pendiente',
    actionLabel: 'Preparacion',
  },
  {
    id: '8',
    tab: 'week',
    dayLabel: 'Jueves',
    dateOrder: 4,
    time: '18:30',
    title: 'Seguimiento con nutricionista',
    location: 'Videollamada',
    type: 'seguimiento',
    status: 'confirmada',
    actionLabel: 'Unirse',
  },
  {
    id: '9',
    tab: 'week',
    dayLabel: 'Viernes',
    dateOrder: 5,
    time: '16:00',
    title: 'Recordatorio de hidratacion',
    location: 'Rutina diaria',
    type: 'recordatorio',
    status: 'pendiente',
    actionLabel: 'Posponer',
  },
  {
    id: '10',
    tab: 'upcoming',
    dayLabel: '02 Jul',
    dateOrder: 10,
    time: '11:15',
    title: 'Control de medicina interna',
    location: 'Centro Medico Norte',
    type: 'cita',
    status: 'confirmada',
    actionLabel: 'Ver detalle',
  },
  {
    id: '11',
    tab: 'upcoming',
    dayLabel: '05 Jul',
    dateOrder: 11,
    time: '08:30',
    title: 'Recordatorio de ayuno previo',
    location: 'Preparacion en casa',
    type: 'recordatorio',
    status: 'pendiente',
    actionLabel: 'Leer indicacion',
  },
  {
    id: '12',
    tab: 'upcoming',
    dayLabel: '08 Jul',
    dateOrder: 12,
    time: '12:00',
    title: 'Entrega de resultados',
    location: 'Portal de salud',
    type: 'examen',
    status: 'completada',
    actionLabel: 'Revisar',
  },
  {
    id: '13',
    tab: 'upcoming',
    dayLabel: '12 Jul',
    dateOrder: 13,
    time: '17:00',
    title: 'Seguimiento post consulta',
    location: 'Llamada con enfermeria',
    type: 'seguimiento',
    status: 'pendiente',
    actionLabel: 'Ver detalle',
  },
];

export const typeStyles: Record<
  ActivityType,
  { label: string; iconBg: string; iconColor: string; badge: string }
> = {
  cita: {
    label: 'Cita',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-600',
  },
  medicamento: {
    label: 'Medicamento',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-600',
  },
  examen: {
    label: 'Examen',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    badge: 'bg-violet-50 text-violet-600',
  },
  recordatorio: {
    label: 'Recordatorio',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-600',
  },
  seguimiento: {
    label: 'Seguimiento',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    badge: 'bg-rose-50 text-rose-500',
  },
};

export const statusStyles: Record<ActivityStatus, string> = {
  confirmada: 'bg-emerald-50 text-emerald-600',
  pendiente: 'bg-amber-50 text-amber-600',
  completada: 'bg-slate-100 text-slate-600',
  cancelada: 'bg-rose-50 text-rose-500',
};

export const contextualCopy: Record<ScheduleTab, string> = {
  today:
    'Revisa lo importante de tu dia y manten tus compromisos de salud en orden.',
  week:
    'Visualiza tu semana con anticipacion y organiza tus actividades medicas con calma.',
  upcoming:
    'Consulta lo que viene mas adelante para prepararte con tiempo.',
};

export const summaryConfig: Record<
  ScheduleTab,
  Array<{ label: string; value: string; helper: string; tone: string }>
> = {
  today: [
    {
      label: 'Citas hoy',
      value: '2',
      helper: 'Controles y atenciones del dia.',
      tone: 'text-blue-600',
    },
    {
      label: 'Recordatorio activo',
      value: '1',
      helper: 'Avisos para acompanar tu rutina.',
      tone: 'text-amber-600',
    },
    {
      label: 'Examen pendiente',
      value: '1',
      helper: 'Preparaciones y controles proximos.',
      tone: 'text-violet-600',
    },
  ],
  week: [
    {
      label: 'Actividades esta semana',
      value: '5',
      helper: 'Rutinas y compromisos en agenda.',
      tone: 'text-blue-600',
    },
    {
      label: 'Controles programados',
      value: '2',
      helper: 'Atenciones ya consideradas.',
      tone: 'text-emerald-600',
    },
    {
      label: 'Seguimiento importante',
      value: '1',
      helper: 'Requiere atencion esta semana.',
      tone: 'text-rose-500',
    },
  ],
  upcoming: [
    {
      label: 'Actividades proximas',
      value: '4',
      helper: 'Compromisos que vienen mas adelante.',
      tone: 'text-blue-600',
    },
    {
      label: 'Cita por confirmar',
      value: '1',
      helper: 'Revisa detalles antes de asistir.',
      tone: 'text-amber-600',
    },
    {
      label: 'Recordatorios futuros',
      value: '2',
      helper: 'Preparaciones y avisos posteriores.',
      tone: 'text-violet-600',
    },
  ],
};

export const daySummaryMessages: Record<ScheduleTab, string> = {
  today: 'Todo listo para tu dia',
  week: 'Tu semana de salud esta bajo control',
  upcoming: 'Tienes tiempo para prepararte con calma',
};

export const preparationItems: PreparationItem[] = [
  {
    id: 'medical-order',
    title: 'Llevar orden medica',
    helper: 'Ten a mano recetas, derivaciones o examenes previos si aplican.',
  },
  {
    id: 'confirm-address',
    title: 'Confirmar direccion',
    helper: 'Revisa la ubicacion del centro y la forma mas simple de llegar.',
  },
  {
    id: 'arrive-early',
    title: 'Llegar 10 minutos antes',
    helper: 'Ese margen te ayuda a registrarte con tranquilidad.',
  },
  {
    id: 'review-instructions',
    title: 'Revisar indicaciones previas',
    helper: 'Comprueba si necesitas ayuno, agua o documentos extra.',
  },
];

export const quickActions: QuickAction[] = [
  {
    id: 'details',
    label: 'Ver detalle',
    helper: 'Consulta lugar, horario y observaciones.',
  },
  {
    id: 'reschedule',
    label: 'Reagendar',
    helper: 'Ajusta tu compromiso si necesitas otro horario.',
  },
  {
    id: 'ready',
    label: 'Marcar como listo',
    helper: 'Confirma que ya preparaste todo para salir.',
  },
];

export function getEventsByTab(activeTab: ScheduleTab) {
  return healthEvents
    .filter((event) => event.tab === activeTab)
    .sort((a, b) => a.dateOrder - b.dateOrder || a.time.localeCompare(b.time));
}

export function getNextEvent(events: HealthEvent[]) {
  return events[0] ?? null;
}

export function getGroupedWeekEvents(events: HealthEvent[]) {
  return events.reduce<Array<{ dayLabel: string; items: HealthEvent[] }>>(
    (groups, event) => {
      const currentGroup = groups.find((group) => group.dayLabel === event.dayLabel);

      if (currentGroup) {
        currentGroup.items.push(event);
        return groups;
      }

      groups.push({ dayLabel: event.dayLabel, items: [event] });
      return groups;
    },
    [],
  );
}

export function getGroupedTodayEvents(events: HealthEvent[]) {
  const ranges = [
    { label: 'Manana', from: 0, to: 11 },
    { label: 'Tarde', from: 12, to: 17 },
    { label: 'Noche', from: 18, to: 23 },
  ];

  return ranges
    .map((range) => ({
      label: range.label,
      items: events.filter((event) => {
        const hour = Number(event.time.split(':')[0]);
        return hour >= range.from && hour <= range.to;
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export function getMiniCalendarDays() {
  return [
    { id: 'mon', label: 'Lun', dateNumber: 15, isToday: false },
    { id: 'tue', label: 'Mar', dateNumber: 16, isToday: true },
    { id: 'wed', label: 'Mie', dateNumber: 17, isToday: false },
    { id: 'thu', label: 'Jue', dateNumber: 18, isToday: false },
    { id: 'fri', label: 'Vie', dateNumber: 19, isToday: false },
    { id: 'sat', label: 'Sab', dateNumber: 20, isToday: false },
    { id: 'sun', label: 'Dom', dateNumber: 21, isToday: false },
  ].map((day, index) => {
    const eventsCount = healthEvents.filter((event) => event.dateOrder === index + 1).length;

    return {
      ...day,
      eventsCount,
      hasEvents: eventsCount > 0,
    };
  });
}

export function EventIcon({ type }: { type: ActivityType }): ReactNode {
  if (type === 'cita') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="17" rx="3" />
      </svg>
    );
  }

  if (type === 'medicamento') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M8 3h8l2 2-8 8-4-4 8-8Z" />
        <path d="m7 14 3 3-4 4-3-3 4-4Z" />
      </svg>
    );
  }

  if (type === 'examen') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M8 3h8l1 4H7z" />
        <path d="M8 8h8v13H8z" />
        <path d="M10 12h4M10 16h4" />
      </svg>
    );
  }

  if (type === 'recordatorio') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 14v7M8.5 17.5h7" />
      <path d="M10 3h4l1 4H9z" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
      <circle cx="12" cy="9" r="3" />
    </svg>
  );
}
