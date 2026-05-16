import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelAppointment,
  CancelAppointmentPayload,
  completeAppointment,
  CompleteAppointmentPayload,
  createAppointment,
  CreateAppointmentPayload,
  getAppointmentById,
  getAppointments,
  GetAppointmentsParams,
  updateAppointment,
  UpdateAppointmentPayload,
} from '@/modules/appointments/api/appointments-api';

export const appointmentsQueryKeys = {
  all: ['appointments'] as const,
  list: (params: GetAppointmentsParams) => ['appointments', 'list', params] as const,
  detail: (id: string) => ['appointments', 'detail', id] as const,
  professionals: ['professionals'] as const,
  schedules: ['schedules'] as const,
  dashboard: ['dashboard'] as const,
};

export function useAppointments(params: GetAppointmentsParams = {}) {
  const query = useQuery({
    queryKey: appointmentsQueryKeys.list(params),
    queryFn: () => getAppointments(params),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: appointmentsQueryKeys.detail(id ?? ''),
    queryFn: () => getAppointmentById(id as string),
    enabled: Boolean(id),
  });
}

function invalidateAppointmentRelated(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.professionals });
  queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.schedules });
  queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.dashboard });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => createAppointment(payload),
    onSuccess: () => invalidateAppointmentRelated(queryClient),
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAppointmentPayload }) =>
      updateAppointment(id, payload),
    onSuccess: (_data, variables) => {
      invalidateAppointmentRelated(queryClient);
      queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CompleteAppointmentPayload }) =>
      completeAppointment(id, payload),
    onSuccess: (_data, variables) => {
      invalidateAppointmentRelated(queryClient);
      queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancelAppointmentPayload }) =>
      cancelAppointment(id, payload),
    onSuccess: (_data, variables) => {
      invalidateAppointmentRelated(queryClient);
      queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.detail(variables.id),
      });
    },
  });
}
