import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Professional,
} from '@/modules/professionals/api/professionals-api';
import { useProfessionals } from '@/modules/professionals/hooks/use-professionals';
import { saveScheduledAppointment } from '@/modules/appointments/data';
import { usePatientProfile } from '@/modules/patient-profiles/hooks/use-patient-profile';
import { routes } from '@/shared/constants/routes';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

type AppointmentFormState = {
  professional: string;
  specialty: string;
  center: string;
  address: string;
  date: string;
  time: string;
  reason: string;
  notes: string;
};

const emptyFormState: AppointmentFormState = {
  professional: '',
  specialty: '',
  center: '',
  address: '',
  date: '',
  time: '',
  reason: '',
  notes: '',
};

function formatIsoToHuman(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const weekday = new Intl.DateTimeFormat('es-CL', { weekday: 'long' }).format(date);
  const dayMonth = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' })
    .format(date)
    .replace('.', '');
  const time = new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dayMonth} · ${time}`;
}

function ProfessionalAppointmentForm({
  formValues,
  formError,
  onChange,
  onCancel,
  onSubmit,
}: {
  formValues: AppointmentFormState;
  formError: string;
  onChange: (field: keyof AppointmentFormState, value: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-600">Nueva cita medica</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
              Agendar proxima cita
            </h1>
            <p className="mt-3 text-base leading-8 text-text-muted">
              Completa los datos principales para dejar registrada tu proxima atencion con este
              profesional.
            </p>
          </div>

          <Button type="button" variant="secondary" className="min-h-11 px-5" onClick={onCancel}>
            Volver a profesionales
          </Button>
        </div>
      </section>

      <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-6">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">Profesional o doctor</span>
              <input
                type="text"
                value={formValues.professional}
                readOnly
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-text-main"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">Especialidad</span>
              <input
                type="text"
                value={formValues.specialty}
                readOnly
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-text-main"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">Centro medico</span>
              <input
                type="text"
                value={formValues.center}
                readOnly
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-text-main"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-text-main">Direccion</span>
              <input
                type="text"
                value={formValues.address}
                readOnly
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-text-main"
              />
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
              <span className="text-sm font-semibold text-text-main">Hora</span>
              <input
                type="time"
                value={formValues.time}
                onChange={(event) => onChange('time', event.target.value)}
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-text-main">Motivo de la cita</span>
              <input
                type="text"
                value={formValues.reason}
                onChange={(event) => onChange('reason', event.target.value)}
                placeholder="Ej. Control de seguimiento, revision de sintomas o evaluacion anual"
                className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-text-main">Observaciones opcionales</span>
              <textarea
                value={formValues.notes}
                onChange={(event) => onChange('notes', event.target.value)}
                rows={4}
                placeholder="Agrega detalles utiles para la visita, documentos por llevar o sintomas a comentar"
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-text-main outline-none transition focus:border-blue-400"
              />
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
              Guardar cita
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function ProfessionalsPage() {
  const navigate = useNavigate();
  const { activeProfile } = usePatientProfile();
  const { data: professionalItems, isLoading, isError } = useProfessionals();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [formValues, setFormValues] = useState<AppointmentFormState>(emptyFormState);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const selectedProfessional = useMemo(
    () =>
      professionalItems?.find((professional) => professional.id === selectedProfessionalId) ?? null,
    [professionalItems, selectedProfessionalId],
  );

  function resetForm() {
    setFormValues(emptyFormState);
    setFormError('');
  }

  function openCreateAppointment(professional: Professional) {
    setSelectedProfessionalId(professional.id);
    setFormValues({
      professional: professional.doctorName,
      specialty: professional.specialty ?? '',
      center: professional.facilityName ?? '',
      address: professional.facilityAddress ?? '',
      date: '',
      time: '',
      reason: '',
      notes: '',
    });
    setFormError('');
    setSuccessMessage('');
    setIsCreatingAppointment(true);
  }

  function closeCreateAppointment() {
    resetForm();
    setSelectedProfessionalId(null);
    setIsCreatingAppointment(false);
  }

  function handleFormChange(field: keyof AppointmentFormState, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleCreateAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.date || !formValues.time || !formValues.reason.trim()) {
      setFormError('Completa fecha, hora y motivo para agendar la cita.');
      return;
    }

    saveScheduledAppointment({
      profileId: activeProfile.id,
      professional: formValues.professional,
      specialty: formValues.specialty,
      center: formValues.center,
      address: formValues.address,
      date: formValues.date,
      time: formValues.time,
      reason: formValues.reason.trim(),
      notes: formValues.notes.trim(),
    });

    closeCreateAppointment();
    setSuccessMessage(
      selectedProfessional
        ? `Cita con ${selectedProfessional.doctorName} guardada correctamente`
        : 'Cita guardada correctamente',
    );
  }

  if (isCreatingAppointment) {
    return (
      <ProfessionalAppointmentForm
        formValues={formValues}
        formError={formError}
        onChange={handleFormChange}
        onCancel={closeCreateAppointment}
        onSubmit={handleCreateAppointment}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-blue-600">Profesionales y centros</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Tus profesionales de salud
          </h1>
          <p className="mt-3 text-base leading-8 text-text-muted">
            Revisa en un solo lugar quien te atiende, donde lo hace y cual es tu siguiente
            atencion o la mas reciente.
          </p>
        </div>
      </section>

      {successMessage ? (
        <Card className="border-emerald-200 bg-emerald-50 p-5 shadow-[0_14px_30px_rgba(16,185,129,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Cita guardada</p>
              <p className="mt-1 text-sm text-emerald-800">{successMessage}</p>
            </div>
            <Button type="button" className="min-h-11 px-5" onClick={() => navigate(routes.appointments)}>
              Ir a Citas
            </Button>
          </div>
        </Card>
      ) : null}

      {isLoading ? (
        <Card className="border-slate-200 bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-text-muted">Cargando profesionales...</p>
        </Card>
      ) : isError ? (
        <Card className="border-amber-200 bg-amber-50 p-6 shadow-[0_16px_32px_rgba(245,158,11,0.08)]">
          <p className="text-sm font-semibold text-amber-700">No pudimos cargar tus profesionales</p>
          <p className="mt-1 text-sm text-amber-800">
            Reintenta en unos segundos. Si el problema persiste, contacta soporte.
          </p>
        </Card>
      ) : !professionalItems || professionalItems.length === 0 ? (
        <Card className="border-slate-200 bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold text-text-main">Sin profesionales registrados</p>
          <p className="mt-1 text-sm text-text-muted">
            Cuando tengas citas con doctores, aparecerán aquí automáticamente.
          </p>
        </Card>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {professionalItems.map((professional) => {
            const nextLabel = formatIsoToHuman(professional.nextAppointmentAt);
            const lastLabel = formatIsoToHuman(
              professional.lastCompletedAt ?? professional.lastAppointmentAt,
            );

            return (
              <Card
                key={professional.id}
                className="border-slate-200 bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.05)]"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      {professional.specialty ? (
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          {professional.specialty}
                        </span>
                      ) : null}
                      <h2 className="mt-3 text-2xl font-bold text-text-main">
                        {professional.doctorName}
                      </h2>
                      {professional.facilityName ? (
                        <p className="mt-2 text-sm font-medium text-text-main">
                          {professional.facilityName}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-[22px] bg-slate-50 px-4 py-3 text-sm text-text-muted">
                      <p className="font-semibold text-text-main">Citas registradas</p>
                      <p className="mt-1 text-lg font-extrabold text-text-main">
                        {professional.totalAppointments}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                        Centro y direccion
                      </p>
                      <p className="mt-3 text-sm font-semibold text-text-main">
                        {professional.facilityName ?? 'Sin centro registrado'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        {professional.facilityAddress ?? 'Sin direccion registrada'}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                        Seguimiento
                      </p>
                      <p className="mt-3 text-sm font-semibold text-text-main">Proxima cita</p>
                      <p className="mt-1 text-sm leading-6 text-text-muted">
                        {nextLabel ?? 'Sin cita agendada'}
                      </p>
                      <p className="mt-4 text-sm font-semibold text-text-main">Ultima atencion</p>
                      <p className="mt-1 text-sm leading-6 text-text-muted">
                        {lastLabel ?? 'Sin atenciones previas registradas'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-11 px-5"
                      onClick={() => openCreateAppointment(professional)}
                    >
                      Preparar proxima cita
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
