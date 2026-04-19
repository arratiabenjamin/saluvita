import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateReminderCommand } from '../commands/create-reminder.command';
import { ActorContext } from '../ports/actor-context';
import type { ReminderRepository } from '../ports/reminder.repository';
import type { ReminderAccessService } from '../ports/reminder-access.service';
import { Reminder } from '../../domain/entities/reminder.entity';
import {
  ReminderDosageRequiredForMedicationError,
  ReminderInvalidDateRangeError,
  ReminderInvalidFrequencyError,
  ReminderInvalidTimeOfDayError,
  ReminderNameRequiredError,
} from '../../domain/errors/reminder-domain.errors';

@Injectable()
export class CreateReminderUseCase {
  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    @Inject('ReminderAccessService')
    private readonly reminderAccessService: ReminderAccessService,
  ) {}

  async execute(command: CreateReminderCommand, actor: ActorContext) {
    await this.reminderAccessService.ensureCanManagePatient(actor, command.patientId);

    try {
      const reminder = Reminder.create({
        id: randomUUID(),
        patientId: command.patientId,
        createdByUserId: actor.userId,
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

      await this.reminderRepository.save(reminder);
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
