import { apiClient } from '@/shared/lib/axios';

export type AppointmentStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED';

export type Appointment = {
  id: string;
  patientId: string;
  recordedByUserId?: string;
  startsAt: string;
  endsAt: string | null;
  status: AppointmentStatus;
  reason: string | null;
  facilityName: string | null;
  facilityAddress: string | null;
  doctorName: string | null;
  specialty: string | null;
  wasAttended: boolean | null;
  diagnosis: string | null;
  conclusion: string | null;
  followUpNotes: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
};

// Alias backward-compat con el tipo previo
export type AppointmentListItem = Appointment;

export type GetAppointmentsParams = {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  search?: string;
};

export type AppointmentsListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetAppointmentsResponse = {
  data: Appointment[];
  meta: AppointmentsListMeta;
};

export type CreateAppointmentPayload = {
  patientId: string;
  startsAt: string;
  endsAt?: string;
  reason?: string;
  facilityName?: string;
  facilityAddress?: string;
  doctorName?: string;
  specialty?: string;
};

export type UpdateAppointmentPayload = {
  startsAt?: string;
  endsAt?: string;
  reason?: string;
  facilityName?: string;
  facilityAddress?: string;
  doctorName?: string;
  specialty?: string;
};

export type CompleteAppointmentPayload = {
  endsAt?: string;
  wasAttended?: boolean;
  diagnosis?: string;
  conclusion?: string;
  followUpNotes?: string;
};

export type CancelAppointmentPayload = {
  cancelledReason: string;
};

function buildQueryParams(
  params: GetAppointmentsParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(params) as [
    keyof GetAppointmentsParams,
    GetAppointmentsParams[keyof GetAppointmentsParams],
  ][]) {
    if (value === undefined) {
      continue;
    }
    query[key] = value;
  }

  return query;
}

export async function getAppointments(
  params: GetAppointmentsParams = {},
): Promise<GetAppointmentsResponse> {
  const { data } = await apiClient.get<GetAppointmentsResponse>('/appointments', {
    params: buildQueryParams(params),
  });

  return data;
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const { data } = await apiClient.get<{ data: Appointment }>(`/appointments/${id}`);
  return data.data;
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<Appointment> {
  const { data } = await apiClient.post<{ data: Appointment }>('/appointments', payload);
  return data.data;
}

export async function updateAppointment(
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<Appointment> {
  const { data } = await apiClient.patch<{ data: Appointment }>(
    `/appointments/${id}`,
    payload,
  );
  return data.data;
}

export async function completeAppointment(
  id: string,
  payload: CompleteAppointmentPayload = {},
): Promise<Appointment> {
  const { data } = await apiClient.patch<{ data: Appointment }>(
    `/appointments/${id}/complete`,
    payload,
  );
  return data.data;
}

export async function cancelAppointment(
  id: string,
  payload: CancelAppointmentPayload,
): Promise<Appointment> {
  const { data } = await apiClient.patch<{ data: Appointment }>(
    `/appointments/${id}/cancel`,
    payload,
  );
  return data.data;
}
