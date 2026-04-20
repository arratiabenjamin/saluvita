import { ReminderLogStatusEnum } from '../enums/reminder-log-status.enum';
import { ReminderLogSkipReasonRequiredError } from '../errors/reminder-domain.errors';

export class ReminderLog {
  static validateStatusPayload(status: ReminderLogStatusEnum, skipReason?: string) {
    if (status === ReminderLogStatusEnum.SKIPPED && !skipReason?.trim()) {
      throw new ReminderLogSkipReasonRequiredError();
    }
  }
}
