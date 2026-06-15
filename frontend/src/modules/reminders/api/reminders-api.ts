import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api';

export type ReminderType = 'GENERAL' | 'MEDICATION' | 'EXAM';
export type ReminderFrequencyUnit = 'HOURS' | 'DAYS' | 'WEEKS';
export type ReminderLogStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED';

export type Reminder = {
  id: string;
  patientId: string;
  type: ReminderType;
  name: string;
  timeOfDay: string; // HH:mm
  dosageAmount: string | null;
  frequencyEvery: number;
  frequencyUnit: ReminderFrequencyUnit;
  startsOn: string;
  untilOn: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetRemindersParams = {
  page?: number;
  limit?: number;
  patientId?: string;
  type?: ReminderType;
  isActive?: boolean;
  search?: string;
};

export type CreateReminderPayload = {
  patientId: string;
  type: ReminderType;
  name: string;
  timeOfDay: string;
  dosageAmount?: string;
  frequencyEvery: number;
  frequencyUnit: ReminderFrequencyUnit;
  startsOn: string; // YYYY-MM-DD
  untilOn?: string;
  notes?: string;
  isActive?: boolean;
};

export type UpdateReminderPayload = {
  type?: ReminderType;
  name?: string;
  timeOfDay?: string;
  dosageAmount?: string;
  frequencyEvery?: number;
  frequencyUnit?: ReminderFrequencyUnit;
  startsOn?: string;
  untilOn?: string;
  notes?: string;
  isActive?: boolean;
};

export type UpsertReminderLogPayload = {
  scheduledFor: string; // ISO datetime
  status: ReminderLogStatus;
  skipReason?: string;
};

function buildQueryParams(params: GetRemindersParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params) as [
    keyof GetRemindersParams,
    GetRemindersParams[keyof GetRemindersParams],
  ][]) {
    if (value === undefined) {
      continue;
    }
    query[key] = value as string | number | boolean;
  }

  return query;
}

export async function getReminders(
  params: GetRemindersParams = {},
): Promise<PaginatedResponse<Reminder>> {
  const { data } = await apiClient.get<PaginatedResponse<Reminder>>('/reminders', {
    params: buildQueryParams(params),
  });
  return data;
}

export async function getReminderById(id: string): Promise<Reminder> {
  const { data } = await apiClient.get<{ data: Reminder }>(`/reminders/${id}`);
  return data.data;
}

export async function createReminder(payload: CreateReminderPayload): Promise<Reminder> {
  const { data } = await apiClient.post<{ data: Reminder }>('/reminders', payload);
  return data.data;
}

export async function updateReminder(
  id: string,
  payload: UpdateReminderPayload,
): Promise<Reminder> {
  const { data } = await apiClient.patch<{ data: Reminder }>(`/reminders/${id}`, payload);
  return data.data;
}

export async function activateReminder(id: string): Promise<Reminder> {
  const { data } = await apiClient.patch<{ data: Reminder }>(`/reminders/${id}/activate`);
  return data.data;
}

export async function deactivateReminder(id: string): Promise<Reminder> {
  const { data } = await apiClient.patch<{ data: Reminder }>(`/reminders/${id}/deactivate`);
  return data.data;
}

export async function upsertReminderLog(
  reminderId: string,
  payload: UpsertReminderLogPayload,
): Promise<{ id: string; status: ReminderLogStatus; scheduledFor: string }> {
  const { data } = await apiClient.put<{
    data: { id: string; status: ReminderLogStatus; scheduledFor: string };
  }>(`/reminders/${reminderId}/logs`, payload);
  return data.data;
}
