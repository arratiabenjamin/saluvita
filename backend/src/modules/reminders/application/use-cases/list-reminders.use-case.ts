import { Inject, Injectable } from '@nestjs/common';
import { ListRemindersQuery } from '../queries/list-reminders.query';
import { ActorContext } from '../ports/actor-context';
import type { ReminderQueryService } from '../ports/reminder-query.service';
import type { ReminderAccessService } from '../ports/reminder-access.service';

@Injectable()
export class ListRemindersUseCase {
  constructor(
    @Inject('ReminderQueryService')
    private readonly reminderQueryService: ReminderQueryService,
    @Inject('ReminderAccessService')
    private readonly reminderAccessService: ReminderAccessService,
  ) {}

  async execute(query: ListRemindersQuery, actor: ActorContext) {
    const scope = await this.reminderAccessService.resolveListScope(actor);
    return this.reminderQueryService.listPaginated(query, scope);
  }
}
