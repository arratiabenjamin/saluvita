import { ListRemindersQuery } from '../queries/list-reminders.query';

export type ReminderListScope =
  | { mode: 'all' }
  | { mode: 'patients'; patientIds: string[] };

export interface ReminderQueryService {
  listPaginated(query: ListRemindersQuery, scope: ReminderListScope): Promise<{
    data: Array<{
      id: string;
      patientId: string;
      type: string;
      name: string;
      timeOfDay: string;
      dosageAmount: string | null;
      frequencyEvery: number;
      frequencyUnit: string;
      startsOn: Date;
      untilOn: Date | null;
      notes: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
}
