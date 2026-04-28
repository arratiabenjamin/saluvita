import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import {
  AppointmentTab,
  contextualCopy,
  daySummaryMessages,
  EventIcon,
  getEventsByTab,
  getGroupedTodayEvents,
  getGroupedWeekEvents,
  getMiniCalendarDays,
  getNextEvent,
  medicalInstructions,
  medicalInstructionStatusStyles,
  MedicalInstruction,
  MedicalInstructionAuthor,
  preparationItems,
  quickActions,
  statusStyles,
  summaryConfig,
  tabs,
  typeStyles,
} from '@/modules/appointments/data';
import { routes } from '@/shared/constants/routes';

type EventListProps = {
  activeTab: AppointmentTab;
};

type InstructionFormState = {
  registeredBy: MedicalInstructionAuthor | '';
  date: string;
  professional: string;
  specialty: string;
  relatedEvent: string;
  clinicalSummary: string;
  doctorInstructions: string;
  exams: string;
  patientActions: string;
  status: MedicalInstruction['status'];
};

const defaultInstructionForm: InstructionFormState = {
  registeredBy: '',
  date: '',
  professional: '',
  specialty: '',
  relatedEvent: '',
  clinicalSummary: '',
  doctorInstructions: '',
  exams: '',
  patientActions: '',
  status: 'Pendiente',
};

const registeredByLabels: Record<MedicalInstructionAuthor, string> = {
  doctor: 'Doctor',
  paciente: 'Paciente',
  acompanante: 'Acompanante',
};

function EventRow({
  time,
  title,
  location,
  professional,
  type,
  status,
  actionLabel,
}: {
  time: string;
  title: string;
  location: string;
  professional: string;
  type: keyof typeof typeStyles;
  status: keyof typeof statusStyles;
  actionLabel: string;
}) {
  const typeStyle = typeStyles[type];

  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="min-w-[84px] rounded-[22px] bg-slate-50 px-4 py-3 text-center">
            <p className="text-lg font-extrabold text-text-main">{time}</p>
          </div>

          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${typeStyle.iconBg} ${typeStyle.iconColor}`}
            >
              <EventIcon type={type} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-text-main">{title}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyle.badge}`}
                >
                  {typeStyle.label}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-text-main">{professional}</p>
              <p className="mt-1 text-sm text-text-muted">{location}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
          >
            {status}
          </span>
          <Button variant="secondary" className="min-h-11 px-5">
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function EventList({ activeTab }: EventListProps) {
  const events = useMemo(() => getEventsByTab(activeTab), [activeTab]);

  if (activeTab === 'today') {
    const groupedEvents = getGroupedTodayEvents(events);

    return (
      <div className="space-y-6">
        {groupedEvents.map((group) => (
          <section key={group.label} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-text-main">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="space-y-4">
              {group.items.map((event) => (
                <EventRow key={event.id} {...event} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (activeTab === 'week') {
    const groupedEvents = getGroupedWeekEvents(events);

    return (
      <div className="space-y-6">
        {groupedEvents.map((group) => (
          <section key={group.dayLabel} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                {group.dayLabel}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="space-y-4">
              {group.items.map((event) => (
                <EventRow key={event.id} {...event} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventRow key={event.id} {...event} />
      ))}
    </div>
  );
}

function NextActivityCard({ activeTab }: EventListProps) {
  const nextEvent = useMemo(() => getNextEvent(getEventsByTab(activeTab)), [activeTab]);

  if (!nextEvent) {
    return null;
  }

  const typeStyle = typeStyles[nextEvent.type];

  return (
    <Card className="overflow-hidden border-blue-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_60%,#f8fbff_100%)] p-0 shadow-[0_22px_48px_rgba(37,99,235,0.14)]">
      <div className="border-b border-blue-100 px-6 py-4 sm:px-7">
        <p className="text-sm font-semibold text-blue-600">Proxima cita o examen</p>
        <p className="mt-2 text-sm text-text-muted">Este es tu siguiente compromiso clinico.</p>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-[24px] bg-white px-4 py-3 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              {nextEvent.dayLabel}
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-text-main">
              {nextEvent.time}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${typeStyle.iconBg} ${typeStyle.iconColor}`}
              >
                <EventIcon type={nextEvent.type} />
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyle.badge}`}
              >
                {typeStyle.label}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-text-main">
              {nextEvent.title}
            </h2>
            <p className="mt-2 text-base font-medium text-text-main">{nextEvent.professional}</p>
            <p className="mt-1 text-base text-text-muted">{nextEvent.location}</p>
          </div>
        </div>

        <div className="space-y-3 lg:max-w-[220px]">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[nextEvent.status]}`}
          >
            {nextEvent.status}
          </span>
          <Button className="min-h-11 w-full px-5">{nextEvent.actionLabel}</Button>
        </div>
      </div>
    </Card>
  );
}

function DaySummaryCard({ activeTab }: EventListProps) {
  const summaryItems = summaryConfig[activeTab];

  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <p className="text-sm font-semibold text-blue-600">Resumen clinico</p>
      <h2 className="mt-2 text-xl font-bold text-text-main">Tu agenda medica</h2>
      <p className="mt-2 text-sm leading-6 text-text-muted">{daySummaryMessages[activeTab]}</p>

      <div className="mt-5 space-y-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-text-main">{item.label}</p>
              <span className={`text-lg font-extrabold ${item.tone}`}>{item.value}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-text-muted">{item.helper}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MiniCalendarCard() {
  const days = getMiniCalendarDays();

  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-600">Mini calendario</p>
          <h2 className="mt-2 text-xl font-bold text-text-main">Semana clinica</h2>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          Atenciones
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.id}
            className={`rounded-[18px] border px-2 py-3 text-center transition ${
              day.isToday
                ? 'border-blue-200 bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)]'
                : day.hasEvents
                  ? 'border-blue-100 bg-blue-50 text-text-main'
                  : 'border-slate-200 bg-slate-50 text-text-muted'
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">{day.label}</p>
            <p className="mt-2 text-lg font-extrabold">{day.dateNumber}</p>
            <div className="mt-2 flex justify-center">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  day.hasEvents
                    ? day.isToday
                      ? 'bg-white'
                      : 'bg-blue-500'
                    : 'bg-slate-200'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-xs text-text-muted">
        <p>El dia actual queda resaltado en azul.</p>
        <p>Los puntos muestran dias con citas medicas o examenes.</p>
      </div>
    </Card>
  );
}

function PreparationCard() {
  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <p className="text-sm font-semibold text-blue-600">Preparacion</p>
      <h2 className="mt-2 text-xl font-bold text-text-main">Antes de tu atencion</h2>

      <div className="mt-5 space-y-3">
        {preparationItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-[20px] bg-slate-50 px-4 py-3">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-semibold text-text-main">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-text-muted">{item.helper}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <p className="text-sm font-semibold text-blue-600">Acciones rapidas</p>
      <h2 className="mt-2 text-xl font-bold text-text-main">Gestiona tus atenciones</h2>

      <div className="mt-5 space-y-3">
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            type="button"
            className={`w-full rounded-[20px] border px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50 ${
              index === 0 ? 'border-blue-100 bg-blue-50' : 'border-slate-200 bg-white'
            }`}
          >
            <p className="text-sm font-semibold text-text-main">{action.label}</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">{action.helper}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}

function MedicalInstructionsSection({
  instructions,
  onStartCreate,
}: {
  instructions: MedicalInstruction[];
  onStartCreate: () => void;
}) {
  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Indicaciones medicas</p>
          <h2 className="mt-2 text-2xl font-bold text-text-main">Lo que te indicaron en consulta</h2>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="text-sm text-text-muted">
            Aqui puedes revisar resumidamente lo que debes seguir despues de cada cita o examen.
          </p>
          <Button type="button" className="min-h-11 px-5" onClick={onStartCreate}>
            Agregar indicacion
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {instructions.map((instruction) => (
          <article
            key={instruction.id}
            className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600">
                    {instruction.date}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Registrado por {registeredByLabels[instruction.registeredBy]}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      medicalInstructionStatusStyles[instruction.status]
                    }`}
                  >
                    {instruction.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-text-main">{instruction.relatedEvent}</h3>
                  <p className="mt-1 text-sm font-medium text-text-main">
                    {instruction.professional} · {instruction.specialty}
                  </p>
                </div>
              </div>

              <div className="rounded-[20px] bg-white px-4 py-3 lg:max-w-[280px]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                  Resumen clinico
                </p>
                <p className="mt-2 text-sm leading-6 text-text-main">{instruction.clinicalSummary}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[22px] bg-white p-4">
                <p className="text-sm font-semibold text-blue-600">Indicaciones del medico</p>
                <p className="mt-2 text-sm leading-6 text-text-main">
                  {instruction.doctorInstructions}
                </p>
              </div>

              <div className="rounded-[22px] bg-white p-4">
                <p className="text-sm font-semibold text-blue-600">Examenes solicitados o revisados</p>
                <div className="mt-3 space-y-2">
                  {instruction.exams.length > 0 ? (
                    instruction.exams.map((exam) => (
                      <div key={exam} className="flex items-start gap-2">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
                        <p className="text-sm leading-6 text-text-main">{exam}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-text-muted">Sin examenes asociados.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[22px] bg-white p-4">
                <p className="text-sm font-semibold text-blue-600">Acciones para ti</p>
                <div className="mt-3 space-y-2">
                  {instruction.patientActions.map((action) => (
                    <div key={action} className="flex items-start gap-2">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <p className="text-sm leading-6 text-text-main">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function CreateInstructionView({
  formValues,
  formError,
  onChange,
  onCancel,
  onSubmit,
}: {
  formValues: InstructionFormState;
  formError: string;
  onChange: (field: keyof InstructionFormState, value: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-600">Nueva indicacion medica</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
              Registrar indicacion medica
            </h1>
            <p className="mt-3 text-base leading-8 text-text-muted">
              Ingresa la informacion de la consulta o examen sin mostrar la vista de citas por detras.
            </p>
          </div>

          <Button type="button" variant="secondary" className="min-h-11 px-5" onClick={onCancel}>
            Volver a citas
          </Button>
        </div>
      </section>

      <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-6">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">Registrado por</span>
              <select
                value={formValues.registeredBy}
                onChange={(event) => onChange('registeredBy', event.target.value)}
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
              >
                <option value="">Seleccionar</option>
                <option value="doctor">Doctor</option>
                <option value="paciente">Paciente</option>
                <option value="acompanante">Acompanante</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">Fecha</span>
              <input
                type="date"
                value={formValues.date}
                onChange={(event) => onChange('date', event.target.value)}
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">Profesional o doctor</span>
              <input
                type="text"
                value={formValues.professional}
                onChange={(event) => onChange('professional', event.target.value)}
                placeholder="Ej. Dra. Javiera Molina"
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">Especialidad</span>
              <input
                type="text"
                value={formValues.specialty}
                onChange={(event) => onChange('specialty', event.target.value)}
                placeholder="Ej. Cardiologia"
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-text-main">Cita o examen asociado</span>
              <input
                type="text"
                value={formValues.relatedEvent}
                onChange={(event) => onChange('relatedEvent', event.target.value)}
                placeholder="Ej. Control de cardiologia"
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-text-main">Resumen clinico breve</span>
              <textarea
                value={formValues.clinicalSummary}
                onChange={(event) => onChange('clinicalSummary', event.target.value)}
                rows={3}
                placeholder="Resumen corto de lo conversado o revisado"
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-text-main">Indicaciones del medico</span>
              <textarea
                value={formValues.doctorInstructions}
                onChange={(event) => onChange('doctorInstructions', event.target.value)}
                rows={4}
                placeholder="Escribe las indicaciones principales"
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">
                Examenes solicitados o revisados
              </span>
              <textarea
                value={formValues.exams}
                onChange={(event) => onChange('exams', event.target.value)}
                rows={4}
                placeholder="Uno por linea"
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">
                Acciones que debe realizar el paciente
              </span>
              <textarea
                value={formValues.patientActions}
                onChange={(event) => onChange('patientActions', event.target.value)}
                rows={4}
                placeholder="Una accion por linea"
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-text-main">Estado</span>
              <select
                value={formValues.status}
                onChange={(event) => onChange('status', event.target.value)}
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Completado">Completado</option>
              </select>
            </label>
          </div>

          {formError ? (
            <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" className="min-h-11 px-5" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-11 px-5">
              Guardar indicacion
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<AppointmentTab>('today');
  const [instructionItems, setInstructionItems] = useState<MedicalInstruction[]>(medicalInstructions);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreatingInstruction, setIsCreatingInstruction] = useState(false);
  const [formValues, setFormValues] = useState<InstructionFormState>(defaultInstructionForm);
  const [formError, setFormError] = useState('');

  function handleAddInstruction(instruction: Omit<MedicalInstruction, 'id'>) {
    setInstructionItems((current) => [
      {
        id: `mi-${current.length + 1}-${Date.now()}`,
        ...instruction,
      },
      ...current,
    ]);
  }

  function resetInstructionForm() {
    setFormValues(defaultInstructionForm);
    setFormError('');
  }

  function handleInstructionSaved() {
    setSuccessMessage('Indicacion guardada correctamente');
  }

  function openCreateInstruction() {
    resetInstructionForm();
    setIsCreatingInstruction(true);
  }

  function closeCreateInstruction() {
    resetInstructionForm();
    setIsCreatingInstruction(false);
  }

  function handleFormChange(field: keyof InstructionFormState, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleCreateInstruction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !formValues.registeredBy ||
      !formValues.date ||
      !formValues.professional.trim() ||
      !formValues.doctorInstructions.trim() ||
      !formValues.patientActions.trim()
    ) {
      setFormError(
        'Completa al menos quien registra, fecha, profesional, indicaciones del medico y acciones para el paciente.',
      );
      return;
    }

    handleAddInstruction({
      registeredBy: formValues.registeredBy,
      date: formValues.date,
      professional: formValues.professional.trim(),
      specialty: formValues.specialty.trim() || 'Sin especialidad informada',
      relatedEvent: formValues.relatedEvent.trim() || 'Sin cita o examen asociado',
      clinicalSummary: formValues.clinicalSummary.trim() || 'Sin resumen clinico adicional.',
      doctorInstructions: formValues.doctorInstructions.trim(),
      exams: formValues.exams
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      patientActions: formValues.patientActions
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      status: formValues.status,
    });

    resetInstructionForm();
    setIsCreatingInstruction(false);
    handleInstructionSaved();
  }

  if (isCreatingInstruction) {
    return (
      <CreateInstructionView
        formValues={formValues}
        formError={formError}
        onChange={handleFormChange}
        onCancel={closeCreateInstruction}
        onSubmit={handleCreateInstruction}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-600">Citas medicas y examenes</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
              Mis citas medicas
            </h1>
            <p className="mt-3 text-base leading-8 text-text-muted">
              Revisa tus controles, examenes y preparaciones clinicas en un solo lugar.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
              {contextualCopy[activeTab]}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <Link to={routes.dashboard}>
              <Button variant="secondary" className="min-h-11 px-5">
                Volver al dashboard
              </Button>
            </Link>

            <div className="flex flex-wrap gap-2 rounded-[24px] bg-slate-50 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-[18px] px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)]'
                      : 'text-text-muted hover:bg-white hover:text-text-main'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.9fr)]">
        <div className="space-y-6">
          {successMessage ? (
            <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <NextActivityCard activeTab={activeTab} />

          <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">Agenda clinica</p>
                <h2 className="mt-2 text-2xl font-bold text-text-main">Tus citas y examenes</h2>
              </div>
              <p className="text-sm text-text-muted">
                {activeTab === 'today'
                  ? 'Ordenada por bloques del dia.'
                  : activeTab === 'week'
                    ? 'Agrupada para seguir cada jornada.'
                    : 'Vista cronologica de tus proximas atenciones.'}
              </p>
            </div>

            <div className="mt-6">
              <EventList activeTab={activeTab} />
            </div>
          </Card>

          <MedicalInstructionsSection
            instructions={instructionItems}
            onStartCreate={openCreateInstruction}
          />
        </div>

        <aside className="space-y-4">
          <DaySummaryCard activeTab={activeTab} />
          <MiniCalendarCard />
          <PreparationCard />
          <QuickActionsCard />
        </aside>
      </section>
    </div>
  );
}
