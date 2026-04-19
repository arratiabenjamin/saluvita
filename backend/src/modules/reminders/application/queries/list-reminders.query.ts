import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';

export type ListRemindersQuery = {
  page: number;
  limit: number;
  patientId?: string;
  type?: ReminderTypeEnum;
  isActive?: boolean;
  search?: string;
};
