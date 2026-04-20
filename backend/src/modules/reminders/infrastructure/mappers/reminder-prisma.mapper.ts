import type {
  Reminder as PrismaReminder,
  ReminderFrequencyUnit,
  ReminderType,
} from '@prisma/client';
import { Reminder } from '../../domain/entities/reminder.entity';
import { ReminderFrequencyUnitEnum } from '../../domain/enums/reminder-frequency-unit.enum';
import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';

export class ReminderPrismaMapper {
  static toPersistence(reminder: Reminder) {
    return {
      id: reminder.id,
      patientId: reminder.patientId,
      createdByUserId: reminder.createdByUserId,
      updatedByUserId: reminder.updatedByUserId ?? null,
      type: reminder.type as ReminderType,
      name: reminder.name,
      timeOfDay: reminder.timeOfDay,
      dosageAmount: reminder.dosageAmount ?? null,
      frequencyEvery: reminder.frequencyEvery,
      frequencyUnit: reminder.frequencyUnit as ReminderFrequencyUnit,
      startsOn: reminder.startsOn,
      untilOn: reminder.untilOn ?? null,
      notes: reminder.notes ?? null,
      isActive: reminder.isActive,
      createdAt: reminder.createdAt ?? new Date(),
      updatedAt: reminder.updatedAt ?? new Date(),
    };
  }

  static toDomain(raw: PrismaReminder): Reminder {
    return Reminder.rehydrate({
      id: raw.id,
      patientId: raw.patientId,
      createdByUserId: raw.createdByUserId,
      updatedByUserId: raw.updatedByUserId ?? undefined,
      type: raw.type as ReminderTypeEnum,
      name: raw.name,
      timeOfDay: raw.timeOfDay,
      dosageAmount: raw.dosageAmount ?? undefined,
      frequencyEvery: raw.frequencyEvery,
      frequencyUnit: raw.frequencyUnit as ReminderFrequencyUnitEnum,
      startsOn: raw.startsOn,
      untilOn: raw.untilOn ?? undefined,
      notes: raw.notes ?? undefined,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
