import { ReminderFrequencyUnitEnum } from '../../domain/enums/reminder-frequency-unit.enum';
import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';

export type UpdateReminderCommand = {
  id: string;
  type?: ReminderTypeEnum;
  name?: string;
  timeOfDay?: string;
  dosageAmount?: string;
  frequencyEvery?: number;
  frequencyUnit?: ReminderFrequencyUnitEnum;
  startsOn?: Date;
  untilOn?: Date;
  notes?: string;
  isActive?: boolean;
};
