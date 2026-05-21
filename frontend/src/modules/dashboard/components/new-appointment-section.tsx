import { useState } from 'react';
import { useCreateAppointment } from '@/modules/appointments/hooks/use-appointments';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { usePatientProfile } from '@/modules/patient-profiles/hooks/use-patient-profile';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export function NewAppointmentSection() {
  const { session } = useAuth();
  const { activeProfile } = usePatientProfile();
  const { mutateAsync, isPending } = useCreateAppointment();

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const patientId = session?.user?.patientId ?? activeProfile?.id ?? '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!patientId) {
      setError('No se pudo identificar el paciente');
      return;
    }
    if (!date || !time) {
      setError('Completá la fecha y la hora');
      return;
    }

    try {
      await mutateAsync({
        patientId,
        startsAt: `${date}T${time}:00`,
        doctorName: doctorName.trim() || undefined,
        specialty: specialty.trim() || undefined,
        facilityName: facilityName.trim() || undefined,
        reason: reason.trim() || undefined,
      });
      setDoctorName('');
      setSpecialty('');
      setFacilityName('');
      setReason('');
      setDate('');
      setTime('');
    } catch {
      setError('Error al agendar la cita. Intentá de nuevo.');
    }
  }

  return (
    <Card className="border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Nueva cita</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-main">
            Agenda una atencion
          </h2>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="M8 2v4M16 2v4M3 10h18" />
            <rect x="3" y="4" width="18" height="17" rx="3" />
            <path d="M12 11v6M9 14h6" />
          </svg>
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Profesional"
          placeholder="Ej. Dra. Javiera Molina"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
        />
        <Input
          label="Especialidad"
          placeholder="Ej. Cardiología"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
        <Input
          label="Centro médico"
          placeholder="Ej. Clínica Central"
          value={facilityName}
          onChange={(e) => setFacilityName(e.target.value)}
        />
        <Input
          label="Motivo de la cita"
          placeholder="Ej. Control de rutina, revisión de exámenes..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Fecha"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Hora"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button type="submit" fullWidth className="min-h-14 text-base" disabled={isPending}>
          {isPending ? 'Agendando...' : 'Reservar nueva cita'}
        </Button>
      </form>
    </Card>
  );
}
