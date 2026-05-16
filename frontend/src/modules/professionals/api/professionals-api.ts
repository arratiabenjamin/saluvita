import { apiClient } from '@/shared/lib/axios';

export type Professional = {
  id: string;
  doctorName: string;
  specialty: string | null;
  facilityName: string | null;
  facilityAddress: string | null;
  totalAppointments: number;
  lastAppointmentAt: string | null;
  lastCompletedAt: string | null;
  nextAppointmentAt: string | null;
};

type GetProfessionalsParams = {
  patientId?: string;
};

export async function getProfessionals(
  params: GetProfessionalsParams = {},
): Promise<Professional[]> {
  const { data } = await apiClient.get<Professional[]>('/api/v1/appointments/professionals', {
    params: params.patientId ? { patientId: params.patientId } : undefined,
  });

  return data;
}
