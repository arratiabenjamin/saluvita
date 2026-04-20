import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ActorContext } from '../ports/actor-context';
import type { ReminderRepository } from '../ports/reminder.repository';
import type { ReminderAccessService } from '../ports/reminder-access.service';

@Injectable()
export class GetReminderByIdUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    @Inject('ReminderAccessService')
    private readonly reminderAccessService: ReminderAccessService,
  ) {}

  async execute(id: string, actor: ActorContext) {
    await this.reminderAccessService.ensureCanReadReminder(actor, id);

    const reminder = await this.reminderRepository.findById(id);
    if (!reminder) throw new NotFoundException('Reminder not found');

    return reminder;
  }
}
