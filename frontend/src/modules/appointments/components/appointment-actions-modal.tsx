import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  useAppointment,
  useCancelAppointment,
  useCompleteAppointment,
  useUpdateAppointment,
} from '@/modules/appointments/hooks/use-appointments';
import { Appointment, AppointmentStatus, UpdateAppointmentPayload } from '@/modules/appointments/api/appointments-api';
import { Button } from '@/shared/ui/button';

type Mode = 'view' | 'edit' | 'complete' | 'cancel';

type AppointmentActionsModalProps = {
  appointmentId: string | null;
  onClose: () => void;
};

const statusLabel: Record<AppointmentStatus, { label: string; className: string }> = {
  PLANNED: { label: 'Planificada', className: 'bg-blue-50 text-blue-700' },
  COMPLETED: { label: 'Completada', className: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Cancelada', className: 'bg-rose-50 text-rose-700' },
};

function splitIsoToParts(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function formatHuman(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function AppointmentActionsModal({
  appointmentId,
  onClose,
}: AppointmentActionsModalProps) {
  const isOpen = Boolean(appointmentId);
  const detail = useAppointment(appointmentId ?? undefined);
  const updateMut = useUpdateAppointment();
  const completeMut = useCompleteAppointment();
  const cancelMut = useCancelAppointment();

  const [mode, setMode] = useState<Mode>('view');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setMode('view');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const appointment = detail.data;
  const isLoading = detail.isLoading;
  const isLocked =
    appointment?.status === 'COMPLETED' || appointment?.status === 'CANCELLED';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)] sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-600">Cita médica</p>
            <h2
              id="appointment-modal-title"
              className="mt-1 text-2xl font-extrabold tracking-tight text-text-main"
            >
              {mode === 'view' && 'Detalle de cita'}
              {mode === 'edit' && 'Editar cita'}
              {mode === 'complete' && 'Completar cita'}
              {mode === 'cancel' && 'Cancelar cita'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-text-muted transition hover:bg-slate-50"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="mt-5">
          {isLoading || !appointment ? (
            <p className="text-sm text-text-muted">Cargando detalle...</p>
          ) : mode === 'view' ? (
            <ViewMode
              appointment={appointment}
              onEdit={() => !isLocked && setMode('edit')}
              onComplete={() => !isLocked && setMode('complete')}
              onCancel={() => !isLocked && setMode('cancel')}
              onClose={onClose}
            />
          ) : mode === 'edit' ? (
            <EditMode
              appointment={appointment}
              isSubmitting={updateMut.isPending}
              error={error}
              onSubmit={async (payload) => {
                setError('');
                try {
                  await updateMut.mutateAsync({ id: appointment.id, payload });
                  setMode('view');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'No pudimos actualizar la cita.');
                }
              }}
              onBack={() => setMode('view')}
            />
          ) : mode === 'complete' ? (
            <CompleteMode
              appointment={appointment}
              isSubmitting={completeMut.isPending}
              error={error}
              onSubmit={async (payload) => {
                setError('');
                try {
                  await completeMut.mutateAsync({ id: appointment.id, payload });
                  setMode('view');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'No pudimos completar la cita.');
                }
              }}
              onBack={() => setMode('view')}
            />
          ) : (
            <CancelMode
              isSubmitting={cancelMut.isPending}
              error={error}
              onSubmit={async (reason) => {
                setError('');
                try {
                  await cancelMut.mutateAsync({
                    id: appointment.id,
                    payload: { cancelledReason: reason },
                  });
                  setMode('view');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'No pudimos cancelar la cita.');
                }
              }}
              onBack={() => setMode('view')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ViewMode({
  appointment,
  onEdit,
  onComplete,
  onCancel,
  onClose,
}: {
  appointment: Appointment;
  onEdit: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  const status = statusLabel[appointment.status];
  const isLocked =
    appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED';

  return (
    <div className="space-y-5">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
      >
        {status.label}
      </span>

      <DetailField label="Cuándo" value={formatHuman(appointment.startsAt)} />
      {appointment.endsAt ? (
        <DetailField label="Finalización" value={formatHuman(appointment.endsAt)} />
      ) : null}
      <DetailField label="Profesional" value={appointment.doctorName ?? '—'} />
      <DetailField label="Especialidad" value={appointment.specialty ?? '—'} />
      <DetailField label="Centro" value={appointment.facilityName ?? '—'} />
      <DetailField label="Dirección" value={appointment.facilityAddress ?? '—'} />
      <DetailField label="Motivo" value={appointment.reason ?? '—'} />

      {appointment.status === 'COMPLETED' ? (
        <>
          <DetailField
            label="Asistió"
            value={
              appointment.wasAttended === true
                ? 'Sí'
                : appointment.wasAttended === false
                  ? 'No'
                  : '—'
            }
          />
          <DetailField label="Diagnóstico" value={appointment.diagnosis ?? '—'} />
          <DetailField label="Conclusión" value={appointment.conclusion ?? '—'} />
          <DetailField label="Notas de seguimiento" value={appointment.followUpNotes ?? '—'} />
        </>
      ) : null}

      {appointment.status === 'CANCELLED' ? (
        <DetailField label="Motivo de cancelación" value={appointment.cancelledReason ?? '—'} />
      ) : null}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
        <Button variant="secondary" className="min-h-11 px-5" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          variant="ghost"
          className="min-h-11 px-5"
          onClick={onCancel}
          disabled={isLocked}
        >
          Cancelar cita
        </Button>
        <Button variant="ghost" className="min-h-11 px-5" onClick={onEdit} disabled={isLocked}>
          Editar
        </Button>
        <Button className="min-h-11 px-5" onClick={onComplete} disabled={isLocked}>
          Marcar completada
        </Button>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="min-w-[140px] text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        {label}
      </span>
      <span className="text-sm leading-6 text-text-main">{value}</span>
    </div>
  );
}

type EditFormState = {
  date: string;
  time: string;
  doctorName: string;
  specialty: string;
  facilityName: string;
  facilityAddress: string;
  reason: string;
};

function EditMode({
  appointment,
  isSubmitting,
  error,
  onSubmit,
  onBack,
}: {
  appointment: Appointment;
  isSubmitting: boolean;
  error: string;
  onSubmit: (payload: UpdateAppointmentPayload) => Promise<void> | void;
  onBack: () => void;
}) {
  const parts = useMemo(() => splitIsoToParts(appointment.startsAt), [appointment.startsAt]);
  const [values, setValues] = useState<EditFormState>(() => ({
    date: parts.date,
    time: parts.time,
    doctorName: appointment.doctorName ?? '',
    specialty: appointment.specialty ?? '',
    facilityName: appointment.facilityName ?? '',
    facilityAddress: appointment.facilityAddress ?? '',
    reason: appointment.reason ?? '',
  }));
  const [localError, setLocalError] = useState('');

  function handleChange<K extends keyof EditFormState>(field: K, value: EditFormState[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError('');
    if (!values.date || !values.time) {
      setLocalError('Fecha y hora son obligatorias.');
      return;
    }
    onSubmit({
      startsAt: combineDateTime(values.date, values.time),
      doctorName: values.doctorName || undefined,
      specialty: values.specialty || undefined,
      facilityName: values.facilityName || undefined,
      facilityAddress: values.facilityAddress || undefined,
      reason: values.reason || undefined,
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Fecha">
          <input
            type="date"
            value={values.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
            required
          />
        </Field>
        <Field label="Hora">
          <input
            type="time"
            value={values.time}
            onChange={(e) => handleChange('time', e.target.value)}
            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
            required
          />
        </Field>
        <Field label="Profesional">
          <input
            type="text"
            value={values.doctorName}
            onChange={(e) => handleChange('doctorName', e.target.value)}
            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
        <Field label="Especialidad">
          <input
            type="text"
            value={values.specialty}
            onChange={(e) => handleChange('specialty', e.target.value)}
            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
        <Field label="Centro">
          <input
            type="text"
            value={values.facilityName}
            onChange={(e) => handleChange('facilityName', e.target.value)}
            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
        <Field label="Dirección">
          <input
            type="text"
            value={values.facilityAddress}
            onChange={(e) => handleChange('facilityAddress', e.target.value)}
            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Motivo">
            <input
              type="text"
              value={values.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
            />
          </Field>
        </div>
      </div>

      {(localError || error) && (
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {localError || error}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 px-5"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Volver
        </Button>
        <Button type="submit" className="min-h-11 px-5" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

type CompleteFormState = {
  wasAttended: 'yes' | 'no' | '';
  diagnosis: string;
  conclusion: string;
  followUpNotes: string;
  endsTime: string;
};

function CompleteMode({
  appointment,
  isSubmitting,
  error,
  onSubmit,
  onBack,
}: {
  appointment: Appointment;
  isSubmitting: boolean;
  error: string;
  onSubmit: (payload: {
    wasAttended?: boolean;
    diagnosis?: string;
    conclusion?: string;
    followUpNotes?: string;
    endsAt?: string;
  }) => Promise<void> | void;
  onBack: () => void;
}) {
  const [values, setValues] = useState<CompleteFormState>({
    wasAttended: '',
    diagnosis: '',
    conclusion: '',
    followUpNotes: '',
    endsTime: '',
  });
  const startParts = useMemo(() => splitIsoToParts(appointment.startsAt), [appointment.startsAt]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endsAt =
      values.endsTime && startParts.date
        ? combineDateTime(startParts.date, values.endsTime)
        : undefined;
    onSubmit({
      wasAttended:
        values.wasAttended === '' ? undefined : values.wasAttended === 'yes',
      diagnosis: values.diagnosis.trim() || undefined,
      conclusion: values.conclusion.trim() || undefined,
      followUpNotes: values.followUpNotes.trim() || undefined,
      endsAt,
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <p className="text-sm text-text-muted">
        Registra cómo terminó la consulta. Todos los campos son opcionales — completá lo que se haya
        registrado en la atención.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="¿Asistió?">
          <select
            value={values.wasAttended}
            onChange={(e) =>
              setValues((c) => ({
                ...c,
                wasAttended: e.target.value as CompleteFormState['wasAttended'],
              }))
            }
            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
          >
            <option value="">Sin registrar</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </Field>
        <Field label="Hora de término">
          <input
            type="time"
            value={values.endsTime}
            onChange={(e) => setValues((c) => ({ ...c, endsTime: e.target.value }))}
            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Diagnóstico">
            <input
              type="text"
              value={values.diagnosis}
              onChange={(e) => setValues((c) => ({ ...c, diagnosis: e.target.value }))}
              className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Conclusión / tratamiento">
            <textarea
              value={values.conclusion}
              onChange={(e) => setValues((c) => ({ ...c, conclusion: e.target.value }))}
              rows={3}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Notas de seguimiento">
            <textarea
              value={values.followUpNotes}
              onChange={(e) => setValues((c) => ({ ...c, followUpNotes: e.target.value }))}
              rows={2}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm"
            />
          </Field>
        </div>
      </div>

      {error && (
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 px-5"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Volver
        </Button>
        <Button type="submit" className="min-h-11 px-5" disabled={isSubmitting}>
          {isSubmitting ? 'Completando...' : 'Marcar como completada'}
        </Button>
      </div>
    </form>
  );
}

function CancelMode({
  isSubmitting,
  error,
  onSubmit,
  onBack,
}: {
  isSubmitting: boolean;
  error: string;
  onSubmit: (reason: string) => Promise<void> | void;
  onBack: () => void;
}) {
  const [reason, setReason] = useState('');
  const [localError, setLocalError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim().length < 3) {
      setLocalError('Ingresá un motivo de al menos 3 caracteres.');
      return;
    }
    setLocalError('');
    onSubmit(reason.trim());
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <p className="text-sm text-text-muted">
        ¿Estás seguro de cancelar esta cita? Decinos el motivo para que quede registrado.
      </p>

      <Field label="Motivo">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          minLength={3}
          required
          className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm"
          placeholder="Ej. Conflicto de horario, urgencia familiar…"
        />
      </Field>

      {(localError || error) && (
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {localError || error}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 px-5"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Volver
        </Button>
        <Button type="submit" className="min-h-11 px-5" disabled={isSubmitting}>
          {isSubmitting ? 'Cancelando...' : 'Confirmar cancelación'}
        </Button>
      </div>
    </form>
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
