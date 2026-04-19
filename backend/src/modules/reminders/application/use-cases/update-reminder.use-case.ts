import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateReminderCommand } from '../commands/update-reminder.command';
import { ActorContext } from '../ports/actor-context';
import type { ReminderRepository } from '../ports/reminder.repository';
import type { ReminderAccessService } from '../ports/reminder-access.service';
import {
  ReminderDosageRequiredForMedicationError,
  ReminderInvalidDateRangeError,
  ReminderInvalidFrequencyError,
  ReminderInvalidTimeOfDayError,
  ReminderNameRequiredError,
} from '../../domain/errors/reminder-domain.errors';

@Injectable()
export class UpdateReminderUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    @Inject('ReminderAccessService')
    private readonly reminderAccessService: ReminderAccessService,
  ) {}

  async execute(command: UpdateReminderCommand, actor: ActorContext) {
    await this.reminderAccessService.ensureCanManageReminder(actor, command.id);

    const reminder = await this.reminderRepository.findById(command.id);
    if (!reminder) throw new NotFoundException('Reminder not found');

    try {
      reminder.update({
        updatedByUserId: actor.userId,
        type: command.type,
        name: command.name,
        timeOfDay: command.timeOfDay,
        dosageAmount: command.dosageAmount,
        frequencyEvery: command.frequencyEvery,
        frequencyUnit: command.frequencyUnit,
        startsOn: command.startsOn,
        untilOn: command.untilOn,
        notes: command.notes,
        isActive: command.isActive,
      });

      await this.reminderRepository.update(reminder);
      return { id: reminder.id };
    } catch (error) {
      this.handleDomainError(error);
      throw error;
    }
  }

  private handleDomainError(error: unknown): never {
    if (
      error instanceof ReminderNameRequiredError ||
      error instanceof ReminderInvalidTimeOfDayError ||
      error instanceof ReminderInvalidFrequencyError ||
      error instanceof ReminderInvalidDateRangeError ||
      error instanceof ReminderDosageRequiredForMedicationError
    ) {
      throw new BadRequestException(error.message);
    }

    throw error;
  }
}
