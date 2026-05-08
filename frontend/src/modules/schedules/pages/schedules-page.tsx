import { useMemo, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { usePatientProfile } from '@/modules/patient-profiles/hooks/use-patient-profile';
import { getMedicationSummaryItems } from '@/modules/appointments/data';
import {
  contextualCopy,
  daySummaryMessages,
  EventIcon,
  getEventsByTab,
  getGroupedTodayEvents,
  getGroupedWeekEvents,
  getMiniCalendarDays,
  getNextEvent,
  preparationItems,
  quickActions,
  ScheduleTab,
  statusStyles,
  summaryConfig,
  tabs,
  typeStyles,
} from '@/modules/schedules/data';

type EventListProps = {
  activeTab: ScheduleTab;
  profileId: string;
};

function CurrentMedicationModal({
  isOpen,
  onClose,
  profileId,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}) {
  const medications = useMemo(() => getMedicationSummaryItems(profileId), [isOpen, profileId]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">Medicacion actual</p>
            <h2 className="mt-1 text-2xl font-bold text-text-main">
              Resumen rapido para mostrar al doctor
            </h2>
          </div>
          <Button type="button" variant="secondary" className="min-h-11 px-5" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-5">
          {medications.length > 0 ? (
            <div className="space-y-4">
              {medications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-text-main">{item.name}</p>
                      <p className="text-sm text-text-muted">
                        <span className="font-semibold text-text-main">Dosis:</span> {item.dose}
                      </p>
                      <p className="text-sm text-text-muted">
                        <span className="font-semibold text-text-main">Frecuencia:</span>{' '}
                        {item.frequencyHours}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-text-muted">
                        <span className="font-semibold text-text-main">Doctor:</span> {item.doctor}
                      </p>
                      <p className="text-sm text-text-muted">
                        <span className="font-semibold text-text-main">Fecha:</span> {item.date}
                      </p>
                      <p className="text-sm text-text-muted">
                        <span className="font-semibold text-text-main">Observacion:</span>{' '}
                        {item.relatedEvent || 'Sin cita asociada'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-text-muted">
              No hay medicamentos registrados actualmente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventRow({
  time,
  title,
  location,
  type,
  status,
  actionLabel,
}: {
  time: string;
  title: string;
  location: string;
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
              <p className="mt-2 text-sm text-text-muted">{location}</p>
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

function EventList({ activeTab, profileId }: EventListProps) {
  const events = useMemo(() => getEventsByTab(activeTab, profileId), [activeTab, profileId]);

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

function NextActivityCard({ activeTab, profileId }: EventListProps) {
  const nextEvent = useMemo(
    () => getNextEvent(getEventsByTab(activeTab, profileId)),
    [activeTab, profileId],
  );

  if (!nextEvent) {
    return null;
  }

  const typeStyle = typeStyles[nextEvent.type];

  return (
    <Card className="overflow-hidden border-blue-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_60%,#f8fbff_100%)] p-0 shadow-[0_22px_48px_rgba(37,99,235,0.14)]">
      <div className="border-b border-blue-100 px-6 py-4 sm:px-7">
        <p className="text-sm font-semibold text-blue-600">Proximo horario</p>
        <p className="mt-2 text-sm text-text-muted">Este es tu siguiente bloque de rutina diaria.</p>
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
            <p className="mt-2 text-base text-text-muted">{nextEvent.location}</p>
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
      <p className="text-sm font-semibold text-blue-600">Resumen de horarios</p>
      <h2 className="mt-2 text-xl font-bold text-text-main">Tu rutina en un vistazo</h2>
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

function MiniCalendarCard({ profileId }: { profileId: string }) {
  const days = getMiniCalendarDays(profileId);

  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-600">Mini calendario</p>
          <h2 className="mt-2 text-xl font-bold text-text-main">Semana de rutina</h2>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          Horarios
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
        <p>Los puntos indican dias con rutinas o recordatorios registrados.</p>
      </div>
    </Card>
  );
}

function PreparationCard() {
  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <p className="text-sm font-semibold text-blue-600">Cuidados</p>
      <h2 className="mt-2 text-xl font-bold text-text-main">Antes de empezar el dia</h2>

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
      <h2 className="mt-2 text-xl font-bold text-text-main">Gestiona tus horarios</h2>

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

function CurrentMedicationCard({ onOpen, profileId }: { onOpen: () => void; profileId: string }) {
  const medications = useMemo(() => getMedicationSummaryItems(profileId), [profileId]);
  const previewItems = medications.slice(0, 3);

  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Medicamentos indicados</p>
          <h2 className="mt-2 text-2xl font-bold text-text-main">Lo que estas tomando hoy</h2>
        </div>
        <Button type="button" className="min-h-11 px-5" onClick={onOpen}>
          Mostrar medicacion actual
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {previewItems.length > 0 ? (
          previewItems.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <p className="text-sm font-semibold text-text-main">{item.name}</p>
              <p className="mt-1 text-sm text-text-muted">
                {item.dose} · {item.frequencyHours}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Indicado por {item.doctor} el {item.date}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-text-muted">
            No hay medicamentos registrados actualmente.
          </div>
        )}
      </div>
    </Card>
  );
}

export function SchedulesPage() {
  const { activeProfile } = usePatientProfile();
  const [activeTab, setActiveTab] = useState<ScheduleTab>('today');
  const [isMedicationOpen, setIsMedicationOpen] = useState(false);

  return (
    <div className="space-y-8">
      <CurrentMedicationModal
        isOpen={isMedicationOpen}
        onClose={() => setIsMedicationOpen(false)}
        profileId={activeProfile.id}
      />

      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-600">Horarios y rutina diaria</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
              Mis horarios de salud
            </h1>
            <p className="mt-3 text-base leading-8 text-text-muted">
              Organiza medicamentos, recordatorios, cuidados y bloques personales del dia.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
              {contextualCopy[activeTab]}
            </p>
          </div>

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
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.9fr)]">
        <div className="space-y-6">
          <NextActivityCard activeTab={activeTab} profileId={activeProfile.id} />

          <CurrentMedicationCard
            onOpen={() => setIsMedicationOpen(true)}
            profileId={activeProfile.id}
          />

          <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">Rutina principal</p>
                <h2 className="mt-2 text-2xl font-bold text-text-main">Tus horarios y cuidados</h2>
              </div>
              <p className="text-sm text-text-muted">
                {activeTab === 'today'
                  ? 'Ordenada por bloques del dia.'
                  : activeTab === 'week'
                    ? 'Agrupada para seguir cada jornada.'
                    : 'Vista cronologica de tus proximos horarios.'}
              </p>
            </div>

            <div className="mt-6">
              <EventList activeTab={activeTab} profileId={activeProfile.id} />
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <DaySummaryCard activeTab={activeTab} profileId={activeProfile.id} />
          <MiniCalendarCard profileId={activeProfile.id} />
          <PreparationCard />
          <QuickActionsCard />
        </aside>
      </section>
    </div>
  );
}
