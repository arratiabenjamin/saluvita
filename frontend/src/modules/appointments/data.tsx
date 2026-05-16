import { ReactNode } from 'react';

export type AppointmentTab = 'today' | 'week' | 'upcoming';
export type ClinicalEventType = 'cita' | 'examen';
export type ClinicalEventStatus = 'confirmada' | 'pendiente' | 'completada' | 'cancelada';

export type ClinicalEvent = {
  id: string;
  profileId: string;
  tab: AppointmentTab;
  dayLabel: string;
  dateOrder: number;
  time: string;
  title: string;
  location: string;
  professional: string;
  type: ClinicalEventType;
  status: ClinicalEventStatus;
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

export type MedicalInstructionStatus = 'Pendiente' | 'En proceso' | 'Completado';
export type MedicalInstructionAuthor = 'doctor' | 'paciente' | 'acompanante';
export type MedicationInstruction = {
  name: string;
  dose: string;
  frequencyHours: string;
};

export type MedicalInstruction = {
  id: string;
  profileId: string;
  registeredBy: MedicalInstructionAuthor;
  date: string;
  professional: string;
  specialty: string;
  relatedEvent: string;
  clinicalSummary: string;
  doctorInstructions: string;
  exams: string[];
  patientActions: string[];
  medication?: MedicationInstruction | null;
  status: MedicalInstructionStatus;
};

export type ScheduledAppointmentDraft = {
  profileId: string;
  professional: string;
  specialty: string;
  center: string;
  address: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
};

type StoredScheduledAppointment = ScheduledAppointmentDraft & {
  id: string;
  createdAt: string;
};

const scheduledAppointmentsStorageKey = 'agenda_medica_scheduled_appointments';
const medicalInstructionsStorageKey = 'agenda_medica_medical_instructions';

export const tabs: Array<{ id: AppointmentTab; label: string }> = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'upcoming', label: 'Proximas' },
];


export const typeStyles: Record<
  ClinicalEventType,
  { label: string; iconBg: string; iconColor: string; badge: string }
> = {
  cita: {
    label: 'Cita medica',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-600',
  },
  examen: {
    label: 'Examen',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    badge: 'bg-violet-50 text-violet-600',
  },
};

export const statusStyles: Record<ClinicalEventStatus, string> = {
  confirmada: 'bg-emerald-50 text-emerald-600',
  pendiente: 'bg-amber-50 text-amber-600',
  completada: 'bg-slate-100 text-slate-600',
  cancelada: 'bg-rose-50 text-rose-500',
};

export const contextualCopy: Record<AppointmentTab, string> = {
  today: 'Consulta tus citas medicas y examenes de hoy con toda la informacion importante.',
  week: 'Organiza tu semana clinica revisando profesionales, centros medicos y preparaciones.',
  upcoming: 'Mantente al dia con tus proximas atenciones y resultados pendientes.',
};

export const summaryConfig: Record<
  AppointmentTab,
  Array<{ label: string; value: string; helper: string; tone: string }>
> = {
  today: [
    {
      label: 'Citas medicas hoy',
      value: '1',
      helper: 'Atenciones clinicas confirmadas para este dia.',
      tone: 'text-blue-600',
    },
    {
      label: 'Examen pendiente',
      value: '1',
      helper: 'Preparacion o revision clinica que requiere atencion.',
      tone: 'text-violet-600',
    },
    {
      label: 'Centro medico',
      value: '2',
      helper: 'Lugares clinicos involucrados en tu jornada.',
      tone: 'text-emerald-600',
    },
  ],
  week: [
    {
      label: 'Atenciones esta semana',
      value: '3',
      helper: 'Citas medicas y examenes distribuidos por jornada.',
      tone: 'text-blue-600',
    },
    {
      label: 'Profesionales asignados',
      value: '2',
      helper: 'Medicos o equipos clinicos que te atenderan.',
      tone: 'text-emerald-600',
    },
    {
      label: 'Preparaciones activas',
      value: '1',
      helper: 'Indicaciones previas que conviene revisar con tiempo.',
      tone: 'text-amber-600',
    },
  ],
  upcoming: [
    {
      label: 'Proximas citas',
      value: '3',
      helper: 'Atenciones clinicas por confirmar o asistir.',
      tone: 'text-blue-600',
    },
    {
      label: 'Resultados por revisar',
      value: '1',
      helper: 'Entregas y revisiones asociadas a examenes.',
      tone: 'text-violet-600',
    },
    {
      label: 'Preparaciones futuras',
      value: '1',
      helper: 'Indicaciones previas para examenes cercanos.',
      tone: 'text-amber-600',
    },
  ],
};

export const daySummaryMessages: Record<AppointmentTab, string> = {
  today: 'Tus atenciones clinicas de hoy estan organizadas',
  week: 'Tu agenda medica de la semana ya esta ordenada',
  upcoming: 'Puedes anticiparte a tus proximas citas y examenes',
};

export const preparationItems: PreparationItem[] = [
  {
    id: 'medical-order',
    title: 'Llevar orden medica',
    helper: 'Ten a mano interconsultas, recetas o examenes previos si aplican.',
  },
  {
    id: 'confirm-location',
    title: 'Confirmar centro medico',
    helper: 'Revisa direccion, piso, box o laboratorio antes de salir.',
  },
  {
    id: 'arrive-early',
    title: 'Llegar 10 minutos antes',
    helper: 'Ese margen ayuda con admision, caja o indicaciones del examen.',
  },
  {
    id: 'review-preparation',
    title: 'Revisar preparacion',
    helper: 'Comprueba ayuno, agua, ropa comoda o documentos requeridos.',
  },
];

export const quickActions: QuickAction[] = [
  {
    id: 'details',
    label: 'Ver detalle',
    helper: 'Consulta profesional, centro medico y observaciones.',
  },
  {
    id: 'reschedule',
    label: 'Reagendar',
    helper: 'Ajusta tu cita o examen si necesitas otro horario.',
  },
  {
    id: 'preparation',
    label: 'Ver preparacion',
    helper: 'Abre indicaciones previas para la atencion seleccionada.',
  },
];

export const medicalInstructionStatusStyles: Record<MedicalInstructionStatus, string> = {
  Pendiente: 'bg-amber-50 text-amber-700',
  'En proceso': 'bg-blue-50 text-blue-700',
  Completado: 'bg-emerald-50 text-emerald-700',
};


function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function matchesProfile(itemProfileId: string, activeProfileId?: string) {
  return !activeProfileId || itemProfileId === activeProfileId;
}

function capitalizeLabel(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getAppointmentDate(date: string, time: string) {
  const parsedDate = new Date(`${date}T${time || '00:00'}:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getDayDifference(targetDate: Date) {
  const today = new Date();
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  return Math.round((selectedDay.getTime() - currentDay.getTime()) / 86400000);
}

function getTabFromDayDifference(dayDifference: number): AppointmentTab {
  if (dayDifference === 0) {
    return 'today';
  }

  if (dayDifference > 0 && dayDifference < 7) {
    return 'week';
  }

  return 'upcoming';
}

function getDayLabel(targetDate: Date, dayDifference: number) {
  if (dayDifference === 0) {
    return 'Hoy';
  }

  if (dayDifference > 0 && dayDifference < 7) {
    return capitalizeLabel(
      new Intl.DateTimeFormat('es-CL', { weekday: 'long' }).format(targetDate),
    );
  }

  const [day, month] = new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
  })
    .format(targetDate)
    .replace('.', '')
    .split(' ');

  return `${day} ${capitalizeLabel(month)}`;
}

function isValidMedicalInstruction(item: unknown): item is MedicalInstruction {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const instruction = item as Record<string, unknown>;

  return (
    typeof instruction.id === 'string' &&
    typeof instruction.profileId === 'string' &&
    typeof instruction.registeredBy === 'string' &&
    typeof instruction.date === 'string' &&
    typeof instruction.professional === 'string' &&
    typeof instruction.specialty === 'string' &&
    typeof instruction.relatedEvent === 'string' &&
    typeof instruction.clinicalSummary === 'string' &&
    typeof instruction.doctorInstructions === 'string' &&
    Array.isArray(instruction.exams) &&
    Array.isArray(instruction.patientActions) &&
    typeof instruction.status === 'string'
  );
}

function readStoredScheduledAppointments(): StoredScheduledAppointment[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(scheduledAppointmentsStorageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (item): item is StoredScheduledAppointment =>
        typeof item?.id === 'string' &&
        typeof item?.profileId === 'string' &&
        typeof item?.professional === 'string' &&
        typeof item?.specialty === 'string' &&
        typeof item?.center === 'string' &&
        typeof item?.address === 'string' &&
        typeof item?.date === 'string' &&
        typeof item?.time === 'string' &&
        typeof item?.reason === 'string',
    );
  } catch {
    return [];
  }
}

function readStoredMedicalInstructions(): MedicalInstruction[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(medicalInstructionsStorageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isValidMedicalInstruction).map((instruction) => ({
      ...instruction,
      medication: instruction.medication ?? null,
    }));
  } catch {
    return [];
  }
}

function mapStoredAppointmentToClinicalEvent(
  appointment: StoredScheduledAppointment,
): ClinicalEvent | null {
  const appointmentDate = getAppointmentDate(appointment.date, appointment.time);

  if (!appointmentDate) {
    return null;
  }

  const dayDifference = getDayDifference(appointmentDate);

  return {
    id: appointment.id,
    profileId: appointment.profileId,
    tab: getTabFromDayDifference(dayDifference),
    dayLabel: getDayLabel(appointmentDate, dayDifference),
    dateOrder: dayDifference,
    time: appointment.time,
    title: appointment.reason,
    location: `${appointment.center} · ${appointment.address}`,
    professional: appointment.professional,
    type: 'cita',
    status: 'confirmada',
    actionLabel: 'Ver detalle',
  };
}


export function saveScheduledAppointment(appointment: ScheduledAppointmentDraft) {
  const nextAppointment: StoredScheduledAppointment = {
    id: `local-appointment-${Date.now()}`,
    ...appointment,
    notes: appointment.notes?.trim() ?? '',
    createdAt: new Date().toISOString(),
  };

  if (canUseStorage()) {
    const currentAppointments = readStoredScheduledAppointments();
    window.localStorage.setItem(
      scheduledAppointmentsStorageKey,
      JSON.stringify([nextAppointment, ...currentAppointments]),
    );
  }

  return nextAppointment;
}

export function getMedicalInstructions(activeProfileId?: string) {
  return readStoredMedicalInstructions().filter((instruction) =>
    matchesProfile(instruction.profileId, activeProfileId),
  );
}

export function saveMedicalInstruction(instruction: MedicalInstruction) {
  if (canUseStorage()) {
    const currentInstructions = readStoredMedicalInstructions();
    window.localStorage.setItem(
      medicalInstructionsStorageKey,
      JSON.stringify([instruction, ...currentInstructions]),
    );
  }

  return instruction;
}

export function getMedicationSummaryItems(activeProfileId?: string) {
  return getMedicalInstructions(activeProfileId)
    .filter((instruction) => instruction.medication)
    .map((instruction) => ({
      id: instruction.id,
      name: instruction.medication?.name ?? '',
      dose: instruction.medication?.dose ?? '',
      frequencyHours: instruction.medication?.frequencyHours ?? '',
      doctor: instruction.professional,
      date: instruction.date,
      relatedEvent: instruction.relatedEvent,
    }));
}

export function getEventsByTab(activeTab: AppointmentTab, activeProfileId?: string) {
  return readStoredScheduledAppointments()
    .map(mapStoredAppointmentToClinicalEvent)
    .filter((event): event is ClinicalEvent => event !== null && matchesProfile(event.profileId, activeProfileId))
    .filter((event) => event.tab === activeTab)
    .sort((a, b) => a.dateOrder - b.dateOrder || a.time.localeCompare(b.time));
}

export function getNextEvent(events: ClinicalEvent[]) {
  return events[0] ?? null;
}

export function getGroupedWeekEvents(events: ClinicalEvent[]) {
  return events.reduce<Array<{ dayLabel: string; items: ClinicalEvent[] }>>(
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

export function getGroupedTodayEvents(events: ClinicalEvent[]) {
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

export function getMiniCalendarDays(events?: Array<{ dateOrder: number }>) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const DAYS = [
    { id: 'mon', label: 'Lun', offset: 0 },
    { id: 'tue', label: 'Mar', offset: 1 },
    { id: 'wed', label: 'Mie', offset: 2 },
    { id: 'thu', label: 'Jue', offset: 3 },
    { id: 'fri', label: 'Vie', offset: 4 },
    { id: 'sat', label: 'Sab', offset: 5 },
    { id: 'sun', label: 'Dom', offset: 6 },
  ];

  return DAYS.map((day) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + day.offset);
    const dayDiff = mondayOffset + day.offset;
    const eventsCount = events
      ? events.filter((e) => e.dateOrder === dayDiff).length
      : 0;

    return {
      id: day.id,
      label: day.label,
      dateNumber: d.getDate(),
      isToday: dayDiff === 0,
      eventsCount,
      hasEvents: eventsCount > 0,
    };
  });
}

export function EventIcon({ type }: { type: ClinicalEventType }): ReactNode {
  if (type === 'cita') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="17" rx="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M8 3h8l1 4H7z" />
      <path d="M8 8h8v13H8z" />
      <path d="M10 12h4M10 16h4" />
    </svg>
  );
}
