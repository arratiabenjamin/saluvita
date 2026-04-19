import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpsertReminderLogCommand } from '../commands/upsert-reminder-log.command';
import { ActorContext } from '../ports/actor-context';
import type { ReminderAccessService } from '../ports/reminder-access.service';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ReminderLog } from '../../domain/entities/reminder-log.entity';
import { ReminderLogStatusEnum } from '../../domain/enums/reminder-log-status.enum';
import { ReminderLogSkipReasonRequiredError } from '../../domain/errors/reminder-domain.errors';

@Injectable()
export class UpsertReminderLogUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('ReminderAccessService')
    private readonly reminderAccessService: ReminderAccessService,
  ) {}

  async execute(command: UpsertReminderLogCommand, actor: ActorContext) {
    await this.reminderAccessService.ensureCanManageReminder(actor, command.reminderId);

    const reminder = await this.prisma.reminder.findFirst({
      where: { id: command.reminderId },
      select: { id: true, patientId: true, startsOn: true, untilOn: true },
    });

    if (!reminder) throw new NotFoundException('Reminder not found');

    try {
      ReminderLog.validateStatusPayload(command.status, command.skipReason);
    } catch (error) {
      if (error instanceof ReminderLogSkipReasonRequiredError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    // MVP: validamos que la ocurrencia no sea anterior al inicio ni posterior al fin (si existe).
    if (command.scheduledFor < reminder.startsOn) {
      throw new BadRequestException('scheduledFor is before reminder startsOn');
    }
    if (reminder.untilOn && command.scheduledFor > reminder.untilOn) {
      throw new BadRequestException('scheduledFor is after reminder untilOn');
    }

    const upserted = await this.prisma.reminderLog.upsert({
      where: {
        reminderId_scheduledFor: {
          reminderId: reminder.id,
          scheduledFor: command.scheduledFor,
        },
      },
      update: {
        status: command.status,
        completedAt: command.status === ReminderLogStatusEnum.COMPLETED ? new Date() : null,
        skipReason: command.status === ReminderLogStatusEnum.SKIPPED ? command.skipReason?.trim() : null,
        createdByUserId: actor.userId,
      },
      create: {
        reminderId: reminder.id,
        patientId: reminder.patientId,
        scheduledFor: command.scheduledFor,
        status: command.status,
        completedAt: command.status === ReminderLogStatusEnum.COMPLETED ? new Date() : null,
        skipReason: command.status === ReminderLogStatusEnum.SKIPPED ? command.skipReason?.trim() : null,
        createdByUserId: actor.userId,
      },
    });

    return { id: upserted.id };
  }
}
