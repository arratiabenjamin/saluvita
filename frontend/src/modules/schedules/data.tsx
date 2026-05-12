import { ReactNode } from 'react';
import { primaryProfileId } from '@/modules/patient-profiles/data';

export type ScheduleTab = 'today' | 'week' | 'upcoming';
export type ActivityType = 'medicamento' | 'recordatorio' | 'seguimiento' | 'cuidado';
export type ActivityStatus = 'confirmada' | 'pendiente' | 'completada' | 'cancelada';

export type HealthEvent = {
  id: string;
  profileId: string;
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
    profileId: primaryProfileId,
    tab: 'today',
    dayLabel: 'Hoy',
    dateOrder: 1,
    time: '08:00',
    title: 'Tomar medicacion de la manana',
    location: 'Rutina en casa',
    type: 'medicamento',
    status: 'pendiente',
    actionLabel: 'Marcar tomado',
  },
  {
    id: '2',
    profileId: primaryProfileId,
    tab: 'today',
    dayLabel: 'Hoy',
    dateOrder: 1,
    time: '10:30',
    title: 'Vaso de agua y pausa activa',
    location: 'Recordatorio diario',
    type: 'recordatorio',
    status: 'pendiente',
    actionLabel: 'Posponer',
  },
  {
    id: '3',
    profileId: primaryProfileId,
    tab: 'today',
    dayLabel: 'Hoy',
    dateOrder: 1,
    time: '16:00',
    title: 'Control de colacion y descanso',
    location: 'Rutina personal',
    type: 'cuidado',
    status: 'confirmada',
    actionLabel: 'Ver detalle',
  },
  {
    id: '4',
    profileId: primaryProfileId,
    tab: 'today',
    dayLabel: 'Hoy',
    dateOrder: 1,
    time: '21:00',
    title: 'Preparar pastillero para manana',
    location: 'Dormitorio',
    type: 'seguimiento',
    status: 'pendiente',
    actionLabel: 'Marcar listo',
  },
  {
    id: '5',
    profileId: primaryProfileId,
    tab: 'week',
    dayLabel: 'Lunes',
    dateOrder: 1,
    time: '08:00',
    title: 'Tomar medicacion de la manana',
    location: 'Rutina en casa',
    type: 'medicamento',
    status: 'pendiente',
    actionLabel: 'Marcar tomado',
  },
  {
    id: '6',
    profileId: primaryProfileId,
    tab: 'week',
    dayLabel: 'Martes',
    dateOrder: 2,
    time: '10:30',
    title: 'Recordatorio de hidratacion',
    location: 'Rutina diaria',
    type: 'recordatorio',
    status: 'pendiente',
    actionLabel: 'Posponer',
  },
  {
    id: '7',
    profileId: primaryProfileId,
    tab: 'week',
    dayLabel: 'Miercoles',
    dateOrder: 3,
    time: '09:00',
    title: 'Ayuno previo para examen del jueves',
    location: 'Preparacion en casa',
    type: 'recordatorio',
    status: 'confirmada',
    actionLabel: 'Leer indicacion',
  },
  {
    id: '8',
    profileId: primaryProfileId,
    tab: 'week',
    dayLabel: 'Jueves',
    dateOrder: 4,
    time: '18:30',
    title: 'Caminata suave de 20 minutos',
    location: 'Barrio o caminadora',
    type: 'cuidado',
    status: 'confirmada',
    actionLabel: 'Registrar avance',
  },
  {
    id: '9',
    profileId: primaryProfileId,
    tab: 'week',
    dayLabel: 'Viernes',
    dateOrder: 5,
    time: '20:30',
    title: 'Revisar horarios del fin de semana',
    location: 'Agenda personal',
    type: 'seguimiento',
    status: 'pendiente',
    actionLabel: 'Actualizar',
  },
  {
    id: '10',
    profileId: primaryProfileId,
    tab: 'upcoming',
    dayLabel: '02 Jul',
    dateOrder: 10,
    time: '07:30',
    title: 'Reiniciar rutina de vitaminas',
    location: 'Cocina',
    type: 'medicamento',
    status: 'confirmada',
    actionLabel: 'Ver horario',
  },
  {
    id: '11',
    profileId: primaryProfileId,
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
    profileId: primaryProfileId,
    tab: 'upcoming',
    dayLabel: '08 Jul',
    dateOrder: 12,
    time: '12:00',
    title: 'Controlar hidratacion en jornada larga',
    location: 'Rutina fuera de casa',
    type: 'cuidado',
    status: 'completada',
    actionLabel: 'Revisar',
  },
  {
    id: '13',
    profileId: primaryProfileId,
    tab: 'upcoming',
    dayLabel: '12 Jul',
    dateOrder: 13,
    time: '21:00',
    title: 'Preparar horarios de medicamentos',
    location: 'Agenda personal',
    type: 'seguimiento',
    status: 'pendiente',
    actionLabel: 'Ver detalle',
  },
];

export const typeStyles: Record<
  ActivityType,
  { label: string; iconBg: string; iconColor: string; badge: string }
> = {
  medicamento: {
    label: 'Medicamento',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-600',
  },
  recordatorio: {
    label: 'Recordatorio',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-600',
  },
  seguimiento: {
    label: 'Seguimiento',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-600',
  },
  cuidado: {
    label: 'Cuidado',
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
  today: 'Revisa tus horarios de hoy y manten tu rutina diaria bajo control.',
  week: 'Ordena tus cuidados de la semana con recordatorios claros y faciles de seguir.',
  upcoming: 'Anticipa tus proximos horarios personales para prepararte con tiempo.',
};

export const summaryConfig: Record<
  ScheduleTab,
  Array<{ label: string; value: string; helper: string; tone: string }>
> = {
  today: [
    {
      label: 'Medicamentos hoy',
      value: '1',
      helper: 'Tomas principales registradas para el dia.',
      tone: 'text-emerald-600',
    },
    {
      label: 'Recordatorios activos',
      value: '1',
      helper: 'Avisos para hidratacion y rutina personal.',
      tone: 'text-amber-600',
    },
    {
      label: 'Cuidados del dia',
      value: '2',
      helper: 'Pausas, seguimiento y organizacion personal.',
      tone: 'text-blue-600',
    },
  ],
  week: [
    {
      label: 'Rutinas esta semana',
      value: '5',
      helper: 'Bloques de cuidado distribuidos por dia.',
      tone: 'text-blue-600',
    },
    {
      label: 'Preparaciones previas',
      value: '1',
      helper: 'Avisos importantes antes de estudios o controles.',
      tone: 'text-amber-600',
    },
    {
      label: 'Seguimientos personales',
      value: '2',
      helper: 'Chequeos para mantener constancia en tu rutina.',
      tone: 'text-rose-500',
    },
  ],
  upcoming: [
    {
      label: 'Horarios proximos',
      value: '4',
      helper: 'Rutinas personales agendadas para mas adelante.',
      tone: 'text-blue-600',
    },
    {
      label: 'Recordatorios previos',
      value: '1',
      helper: 'Preparaciones que conviene dejar visibles.',
      tone: 'text-amber-600',
    },
    {
      label: 'Cuidados planificados',
      value: '2',
      helper: 'Acciones de autocuidado ya previstas.',
      tone: 'text-emerald-600',
    },
  ],
};

export const daySummaryMessages: Record<ScheduleTab, string> = {
  today: 'Tu rutina diaria esta clara para hoy',
  week: 'Tus horarios personales estan organizados para la semana',
  upcoming: 'Tienes tiempo para preparar tus proximos cuidados',
};

export const preparationItems: PreparationItem[] = [
  {
    id: 'medication-box',
    title: 'Preparar pastillero',
    helper: 'Deja listas las tomas del dia siguiente para evitar olvidos.',
  },
  {
    id: 'water-bottle',
    title: 'Tener agua a mano',
    helper: 'Mantener tu botella visible ayuda con la hidratacion.',
  },
  {
    id: 'daily-notes',
    title: 'Revisar notas personales',
    helper: 'Anota sintomas, energia o cambios para seguir tu rutina.',
  },
  {
    id: 'alarm-check',
    title: 'Confirmar alarmas',
    helper: 'Verifica que tus recordatorios sigan activos en los horarios correctos.',
  },
];

export const quickActions: QuickAction[] = [
  {
    id: 'check-routine',
    label: 'Ver rutina',
    helper: 'Consulta el detalle de tus horarios personales.',
  },
  {
    id: 'mark-ready',
    label: 'Marcar como listo',
    helper: 'Confirma que ya preparaste lo necesario para hoy.',
  },
  {
    id: 'adjust-alerts',
    label: 'Ajustar recordatorios',
    helper: 'Reorganiza alarmas y bloques de cuidado rapidamente.',
  },
];

function matchesProfile(itemProfileId: string, activeProfileId?: string) {
  return !activeProfileId || itemProfileId === activeProfileId;
}

export function getEventsByTab(activeTab: ScheduleTab, activeProfileId?: string) {
  return healthEvents
    .filter((event) => matchesProfile(event.profileId, activeProfileId))
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

export function getMiniCalendarDays(activeProfileId?: string) {
  return [
    { id: 'mon', label: 'Lun', dateNumber: 15, isToday: false },
    { id: 'tue', label: 'Mar', dateNumber: 16, isToday: true },
    { id: 'wed', label: 'Mie', dateNumber: 17, isToday: false },
    { id: 'thu', label: 'Jue', dateNumber: 18, isToday: false },
    { id: 'fri', label: 'Vie', dateNumber: 19, isToday: false },
    { id: 'sat', label: 'Sab', dateNumber: 20, isToday: false },
    { id: 'sun', label: 'Dom', dateNumber: 21, isToday: false },
  ].map((day, index) => {
    const eventsCount = healthEvents.filter(
      (event) => matchesProfile(event.profileId, activeProfileId) && event.dateOrder === index + 1,
    ).length;

    return {
      ...day,
      eventsCount,
      hasEvents: eventsCount > 0,
    };
  });
}

export function EventIcon({ type }: { type: ActivityType }): ReactNode {
  if (type === 'medicamento') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M8 3h8l2 2-8 8-4-4 8-8Z" />
        <path d="m7 14 3 3-4 4-3-3 4-4Z" />
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

  if (type === 'seguimiento') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M3 12h4l2-4 4 8 2-4h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
      <path d="M19 7h2M20 6v2" />
    </svg>
  );
}
