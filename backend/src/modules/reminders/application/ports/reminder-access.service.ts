import { ActorContext } from './actor-context';
import { ReminderListScope } from './reminder-query.service';

export interface ReminderAccessService {
  ensureCanManagePatient(actor: ActorContext, patientId: string): Promise<void>;
  ensureCanReadReminder(actor: ActorContext, reminderId: string): Promise<void>;
  ensureCanManageReminder(actor: ActorContext, reminderId: string): Promise<void>;
  resolveListScope(actor: ActorContext): Promise<ReminderListScope>;
}
