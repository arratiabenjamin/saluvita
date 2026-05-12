import { apiClient } from '@/shared/lib/axios';

type GetAppointmentsParams = {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: 'PLANNED' | 'COMPLETED' | 'CANCELLED';
  from?: string;
  to?: string;
  search?: string;
};

type AppointmentListItem = {
  id: string;
  patientId: string;
  startsAt: string;
  endsAt: string | null;
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED';
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

type GetAppointmentsResponse = {
  data: AppointmentListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function buildQueryParams(params: GetAppointmentsParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(params) as [keyof GetAppointmentsParams, GetAppointmentsParams[keyof GetAppointmentsParams]][]) {
    if (value === undefined) {
      continue;
    }
    query[key] = value;
  }

  return query;
}

export async function getAppointments(params: GetAppointmentsParams): Promise<GetAppointmentsResponse> {
  const { data } = await apiClient.get<GetAppointmentsResponse>('/api/v1/appointments', {
    params: buildQueryParams(params),
  });

  return data;
}
