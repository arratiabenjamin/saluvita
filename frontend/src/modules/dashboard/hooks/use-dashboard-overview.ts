import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '@/modules/dashboard/api/dashboard-api';

type DashboardOverviewQueryParams = NonNullable<Parameters<typeof getDashboardOverview>[0]>;

export function useDashboardOverview(params?: DashboardOverviewQueryParams) {
  const patientId = params?.patientId;

  const query = useQuery({
    queryKey: ['dashboard', 'overview', { patientId }] as const,
    queryFn: () => getDashboardOverview(params),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
