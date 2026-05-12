import { apiClient } from '@/shared/lib/axios';

type GetSchedulesOverviewParams = {
  view?: 'today' | 'week' | 'upcoming';
  patientId?: string;
};

type SchedulesOverviewEvent = {
  eventId: string;
  reminderId: string;
  patientId: string;
  scheduledFor: string;
  dayLabel: string;
  time: string;
  title: string;
  location: string;
  type: 'medicamento' | 'recordatorio' | 'examen';
  status: 'pendiente' | 'completada' | 'cancelada';
  actionLabel: string;
  dosageAmount?: string;
  notes?: string;
};

type SchedulesDaySummary = {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
};

type SchedulesMiniCalendarDay = {
  dayLabel: string;
  date: string;
  eventsCount: number;
  isToday: boolean;
};

type SchedulesOverviewPayload = {
  view: 'today' | 'week' | 'upcoming';
  timezone: string;
  range: { from: string; to: string };
  nextEvent: SchedulesOverviewEvent | null;
  events: SchedulesOverviewEvent[];
  daySummary: SchedulesDaySummary;
  miniCalendarWeek: SchedulesMiniCalendarDay[];
};

type GetSchedulesOverviewResponse = {
  data: SchedulesOverviewPayload;
};

function buildQueryParams(params: GetSchedulesOverviewParams): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.view !== undefined) {
    query.view = params.view;
  }

  if (params.patientId !== undefined) {
    query.patientId = params.patientId;
  }

  return query;
}

export async function getSchedulesOverview(
  params?: GetSchedulesOverviewParams,
): Promise<GetSchedulesOverviewResponse> {
  const queryParams = buildQueryParams(params ?? {});

  const { data } = await apiClient.get<GetSchedulesOverviewResponse>('/api/v1/schedules/overview', {
    params: queryParams,
  });

  return data;
}
