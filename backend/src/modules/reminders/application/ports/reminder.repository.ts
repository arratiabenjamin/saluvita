import { Reminder } from '../../domain/entities/reminder.entity';

export interface ReminderRepository {
  save(reminder: Reminder): Promise<void>;
  findById(id: string): Promise<Reminder | null>;
  update(reminder: Reminder): Promise<void>;
}
