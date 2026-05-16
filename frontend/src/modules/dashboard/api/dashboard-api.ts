import { apiClient } from '@/shared/lib/axios';

type GetDashboardOverviewParams = {
  patientId?: string;
};

type DashboardQuickSummary = {
  upcomingAppointmentsCount: number;
  todayPendingRemindersCount: number;
  completedThisWeekCount: number;
  alertsCount: number;
  overallStatus: 'OK' | 'ATTENTION';
};

type DashboardUpcomingAppointment = {
  id: string;
  patientId: string;
  startsAt: string;
  status: string;
  doctorName: string | null;
  specialty: string | null;
  facilityName: string | null;
};

type DashboardRecentDiagnostic = {
  id: string;
  title: string;
  description: string;
  date: string;
  doctorName: string | null;
  specialty: string | null;
};

type DashboardHealthSummary = {
  nextControlText: string;
  observation: string;
  stable: boolean;
};

type DashboardOverviewPayload = {
  quickSummary: DashboardQuickSummary;
  upcomingAppointments: DashboardUpcomingAppointment[];
  recentDiagnostics: DashboardRecentDiagnostic[];
  healthSummary: DashboardHealthSummary;
};

type GetDashboardOverviewResponse = {
  data: DashboardOverviewPayload;
};

function buildQueryParams(params: GetDashboardOverviewParams): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.patientId !== undefined) {
    query.patientId = params.patientId;
  }

  return query;
}

export async function getDashboardOverview(
  params?: GetDashboardOverviewParams,
): Promise<GetDashboardOverviewResponse> {
  const queryParams = buildQueryParams(params ?? {});

  const { data } = await apiClient.get<GetDashboardOverviewResponse>('/dashboard/overview', {
    params: queryParams,
  });

  return data;
}
