import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '@/modules/appointments/api/appointments-api';

type AppointmentsQueryParams = Parameters<typeof getAppointments>[0];

export function useAppointments(params: AppointmentsQueryParams) {
  const { page, limit, patientId, status, from, to, search } = params;

  const query = useQuery({
    queryKey: ['appointments', { page, limit, patientId, status, from, to, search }] as const,
    queryFn: () => getAppointments(params),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
