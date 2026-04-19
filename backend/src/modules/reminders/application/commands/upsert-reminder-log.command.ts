import { ReminderLogStatusEnum } from '../../domain/enums/reminder-log-status.enum';

export type UpsertReminderLogCommand = {
  reminderId: string;
  scheduledFor: Date;
  status: ReminderLogStatusEnum;
  skipReason?: string;
};
