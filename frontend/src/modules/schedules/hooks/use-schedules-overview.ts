import { useQuery } from '@tanstack/react-query';
import { getSchedulesOverview } from '@/modules/schedules/api/schedules-api';

type SchedulesOverviewQueryParams = NonNullable<Parameters<typeof getSchedulesOverview>[0]>;

export function useSchedulesOverview(params?: SchedulesOverviewQueryParams) {
  const view = params?.view;
  const patientId = params?.patientId;

  const query = useQuery({
    queryKey: ['schedules', 'overview', { view, patientId }] as const,
    queryFn: () => getSchedulesOverview(params),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
