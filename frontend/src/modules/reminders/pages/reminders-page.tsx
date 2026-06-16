import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CreateReminderPayload,
  Reminder,
  ReminderFrequencyUnit,
  ReminderType,
  UpdateReminderPayload,
} from '@/modules/reminders/api/reminders-api';
import {
  useCreateReminder,
  useReminders,
  useToggleReminderActive,
  useUpdateReminder,
} from '@/modules/reminders/hooks/use-reminders';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Pagination } from '@/shared/ui/pagination';

const typeLabel: Record<ReminderType, string> = {
  GENERAL: 'General',
  MEDICATION: 'Medicamento',
  EXAM: 'Examen',
};

const frequencyUnitLabel: Record<ReminderFrequencyUnit, string> = {
  HOURS: 'horas',
  DAYS: 'días',
  WEEKS: 'semanas',
};

type ActiveFilter = 'all' | 'active' | 'inactive';

export function RemindersPage() {
  const { session } = useAuth();
  const patientId = session?.user?.patientId ?? null;

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const status = (searchParams.get('status') as ActiveFilter | null) ?? 'active';
  const activeFilter: ActiveFilter = ['all', 'active', 'inactive'].includes(status)
    ? (status as ActiveFilter)
    : 'active';

  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filterParam: { isActive?: boolean } =
    activeFilter === 'all' ? {} : { isActive: activeFilter === 'active' };

  const { data, isFetching, isLoading, isError } = useReminders(
    patientId ? { patientId, ...filterParam, page } : { ...filterParam, page },
  );

  const totalPages = data?.meta.totalPages ?? 1;

  const toggleMut = useToggleReminderActive();

  const reminders = data?.data ?? [];

  // Clamp out-of-range page
  useEffect(() => {
    if (data?.meta && data.meta.totalPages >= 1 && page > data.meta.totalPages) {
      setSearchParams(
        (prev) => {
          prev.set('page', String(data.meta.totalPages));
          return prev;
        },
        { replace: true },
      );
    }
  }, [page, data?.meta, setSearchParams]);

  function handleFilterChange(value: ActiveFilter) {
    setSearchParams(
      (prev) => {
        prev.set('status', value);
        prev.set('page', '1');
        return prev;
      },
      { replace: true },
    );
  }

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      prev.set('page', String(newPage));
      return prev;
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-600">Recordatorios</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
              Tus recordatorios diarios
            </h1>
            <p className="mt-3 text-base leading-8 text-text-muted">
              Crea y administra recordatorios de medicamentos, exámenes y actividades para no
              olvidar nada importante.
            </p>
          </div>

          <Button
            className="min-h-11 px-5"
            onClick={() => {
              setEditingReminder(null);
              setIsCreating(true);
            }}
            disabled={!patientId}
          >
            Nuevo recordatorio
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(['active', 'inactive', 'all'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleFilterChange(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeFilter === value
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                  : 'text-text-muted hover:bg-slate-50'
              }`}
            >
              {value === 'active' ? 'Activos' : value === 'inactive' ? 'Inactivos' : 'Todos'}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-text-muted">Cargando recordatorios...</p>
        </Card>
      ) : isError ? (
        <Card className="border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-amber-700">
            No pudimos cargar tus recordatorios
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Intentá refrescar o volvé a iniciar sesión.
          </p>
        </Card>
      ) : reminders.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm font-semibold text-text-main">Sin recordatorios todavía</p>
          <p className="mt-1 text-sm text-text-muted">
            Creá tu primero para que aparezca en Horarios y Dashboard.
          </p>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {reminders.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              onEdit={() => {
                setIsCreating(false);
                setEditingReminder(reminder);
              }}
              onToggle={() =>
                toggleMut.mutate({ id: reminder.id, activate: !reminder.isActive })
              }
              toggleLoading={toggleMut.isPending && toggleMut.variables?.id === reminder.id}
            />
          ))}
        </section>
      )}

      {!isError ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={isFetching}
          className="py-2"
        />
      ) : null}

      {(isCreating || editingReminder) && patientId ? (
        <ReminderFormModal
          patientId={patientId}
          editing={editingReminder}
          onClose={() => {
            setIsCreating(false);
            setEditingReminder(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ReminderRow({
  reminder,
  onEdit,
  onToggle,
  toggleLoading,
}: {
  reminder: Reminder;
  onEdit: () => void;
  onToggle: () => void;
  toggleLoading: boolean;
}) {
  return (
    <Card className="border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              {typeLabel[reminder.type]}
            </span>
            <h2 className="mt-2 text-xl font-bold text-text-main">{reminder.name}</h2>
            <p className="mt-1 text-sm text-text-muted">
              {reminder.timeOfDay} · cada {reminder.frequencyEvery}{' '}
              {frequencyUnitLabel[reminder.frequencyUnit]}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              reminder.isActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {reminder.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {reminder.dosageAmount ? (
          <p className="text-sm text-text-main">
            <span className="font-semibold">Dosis:</span> {reminder.dosageAmount}
          </p>
        ) : null}

        {reminder.notes ? (
          <p className="text-sm leading-6 text-text-muted">{reminder.notes}</p>
        ) : null}

        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <Button variant="secondary" className="min-h-11 px-4" onClick={onEdit}>
            Editar
          </Button>
          <Button
            variant="ghost"
            className="min-h-11 px-4"
            onClick={onToggle}
            disabled={toggleLoading}
          >
            {toggleLoading
              ? 'Aplicando...'
              : reminder.isActive
                ? 'Desactivar'
                : 'Activar'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

type ReminderFormState = {
  type: ReminderType;
  name: string;
  timeOfDay: string;
  dosageAmount: string;
  frequencyEvery: number;
  frequencyUnit: ReminderFrequencyUnit;
  startsOn: string;
  untilOn: string;
  notes: string;
};

function buildInitial(reminder: Reminder | null): ReminderFormState {
  if (!reminder) {
    return {
      type: 'GENERAL',
      name: '',
      timeOfDay: '08:00',
      dosageAmount: '',
      frequencyEvery: 1,
      frequencyUnit: 'DAYS',
      startsOn: new Date().toISOString().slice(0, 10),
      untilOn: '',
      notes: '',
    };
  }
  return {
    type: reminder.type,
    name: reminder.name,
    timeOfDay: reminder.timeOfDay,
    dosageAmount: reminder.dosageAmount ?? '',
    frequencyEvery: reminder.frequencyEvery,
    frequencyUnit: reminder.frequencyUnit,
    startsOn: reminder.startsOn.slice(0, 10),
    untilOn: reminder.untilOn ? reminder.untilOn.slice(0, 10) : '',
    notes: reminder.notes ?? '',
  };
}

function ReminderFormModal({
  patientId,
  editing,
  onClose,
}: {
  patientId: string;
  editing: Reminder | null;
  onClose: () => void;
}) {
  const initial = useMemo(() => buildInitial(editing), [editing]);
  const [values, setValues] = useState<ReminderFormState>(initial);
  const [error, setError] = useState('');

  const createMut = useCreateReminder();
  const updateMut = useUpdateReminder();
  const isPending = createMut.isPending || updateMut.isPending;
  const isEditing = Boolean(editing);

  function patch<K extends keyof ReminderFormState>(key: K, value: ReminderFormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!values.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    if (values.type === 'MEDICATION' && !values.dosageAmount.trim()) {
      setError('Para tipo Medicamento, la dosis es obligatoria.');
      return;
    }

    try {
      if (isEditing && editing) {
        const payload: UpdateReminderPayload = {
          type: values.type,
          name: values.name.trim(),
          timeOfDay: values.timeOfDay,
          dosageAmount: values.dosageAmount.trim() || undefined,
          frequencyEvery: values.frequencyEvery,
          frequencyUnit: values.frequencyUnit,
          startsOn: values.startsOn,
          untilOn: values.untilOn || undefined,
          notes: values.notes.trim() || undefined,
        };
        await updateMut.mutateAsync({ id: editing.id, payload });
      } else {
        const payload: CreateReminderPayload = {
          patientId,
          type: values.type,
          name: values.name.trim(),
          timeOfDay: values.timeOfDay,
          dosageAmount: values.dosageAmount.trim() || undefined,
          frequencyEvery: values.frequencyEvery,
          frequencyUnit: values.frequencyUnit,
          startsOn: values.startsOn,
          untilOn: values.untilOn || undefined,
          notes: values.notes.trim() || undefined,
        };
        await createMut.mutateAsync(payload);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos guardar el recordatorio.');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)] sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Recordatorios</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-text-main">
              {isEditing ? 'Editar recordatorio' : 'Nuevo recordatorio'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-text-muted transition hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tipo">
              <select
                value={values.type}
                onChange={(e) => patch('type', e.target.value as ReminderType)}
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
              >
                <option value="GENERAL">General</option>
                <option value="MEDICATION">Medicamento</option>
                <option value="EXAM">Examen</option>
              </select>
            </Field>
            <Field label="Nombre">
              <input
                type="text"
                value={values.name}
                onChange={(e) => patch('name', e.target.value)}
                required
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
              />
            </Field>
            <Field label="Hora del día">
              <input
                type="time"
                value={values.timeOfDay}
                onChange={(e) => patch('timeOfDay', e.target.value)}
                required
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
              />
            </Field>
            {values.type === 'MEDICATION' ? (
              <Field label="Dosis">
                <input
                  type="text"
                  value={values.dosageAmount}
                  onChange={(e) => patch('dosageAmount', e.target.value)}
                  placeholder="Ej. 1 comprimido"
                  className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
                />
              </Field>
            ) : (
              <Field label="Dosis (opcional)">
                <input
                  type="text"
                  value={values.dosageAmount}
                  onChange={(e) => patch('dosageAmount', e.target.value)}
                  className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
                />
              </Field>
            )}
            <Field label="Repetir cada">
              <input
                type="number"
                min={1}
                max={999}
                value={values.frequencyEvery}
                onChange={(e) =>
                  patch('frequencyEvery', Math.max(1, Number(e.target.value) || 1))
                }
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
              />
            </Field>
            <Field label="Unidad">
              <select
                value={values.frequencyUnit}
                onChange={(e) => patch('frequencyUnit', e.target.value as ReminderFrequencyUnit)}
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
              >
                <option value="HOURS">Horas</option>
                <option value="DAYS">Días</option>
                <option value="WEEKS">Semanas</option>
              </select>
            </Field>
            <Field label="Desde">
              <input
                type="date"
                value={values.startsOn}
                onChange={(e) => patch('startsOn', e.target.value)}
                required
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
              />
            </Field>
            <Field label="Hasta (opcional)">
              <input
                type="date"
                value={values.untilOn}
                onChange={(e) => patch('untilOn', e.target.value)}
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notas">
                <textarea
                  rows={3}
                  value={values.notes}
                  onChange={(e) => patch('notes', e.target.value)}
                  className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </Field>
            </div>
          </div>

          {error ? (
            <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 px-5"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" className="min-h-11 px-5" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear recordatorio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-text-main">{label}</span>
      {children}
    </label>
  );
}
