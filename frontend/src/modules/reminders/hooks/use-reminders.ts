import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateReminder,
  createReminder,
  CreateReminderPayload,
  deactivateReminder,
  getReminderById,
  getReminders,
  GetRemindersParams,
  updateReminder,
  UpdateReminderPayload,
  upsertReminderLog,
  UpsertReminderLogPayload,
} from '@/modules/reminders/api/reminders-api';

export const remindersQueryKeys = {
  all: ['reminders'] as const,
  list: (params: GetRemindersParams) => ['reminders', 'list', params] as const,
  detail: (id: string) => ['reminders', 'detail', id] as const,
  schedules: ['schedules'] as const,
  dashboard: ['dashboard'] as const,
};

export function useReminders(params: GetRemindersParams = {}) {
  const query = useQuery({
    queryKey: remindersQueryKeys.list(params),
    queryFn: () => getReminders(params),
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useReminder(id: string | undefined) {
  return useQuery({
    queryKey: remindersQueryKeys.detail(id ?? ''),
    queryFn: () => getReminderById(id as string),
    enabled: Boolean(id),
  });
}

function invalidateReminderRelated(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: remindersQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: remindersQueryKeys.schedules });
  queryClient.invalidateQueries({ queryKey: remindersQueryKeys.dashboard });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReminderPayload) => createReminder(payload),
    onSuccess: () => invalidateReminderRelated(queryClient),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReminderPayload }) =>
      updateReminder(id, payload),
    onSuccess: (_data, variables) => {
      invalidateReminderRelated(queryClient);
      queryClient.invalidateQueries({
        queryKey: remindersQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useToggleReminderActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      activate ? activateReminder(id) : deactivateReminder(id),
    onSuccess: (_data, variables) => {
      invalidateReminderRelated(queryClient);
      queryClient.invalidateQueries({
        queryKey: remindersQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useUpsertReminderLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reminderId, payload }: { reminderId: string; payload: UpsertReminderLogPayload }) =>
      upsertReminderLog(reminderId, payload),
    onSuccess: () => {
      invalidateReminderRelated(queryClient);
    },
  });
}
