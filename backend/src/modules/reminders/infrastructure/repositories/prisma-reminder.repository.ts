import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import type { ReminderRepository } from '../../application/ports/reminder.repository';
import { Reminder } from '../../domain/entities/reminder.entity';
import { ReminderPrismaMapper } from '../mappers/reminder-prisma.mapper';

@Injectable()
export class PrismaReminderRepository implements ReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(reminder: Reminder): Promise<void> {
    const data = ReminderPrismaMapper.toPersistence(reminder);
    await this.prisma.reminder.create({ data });
  }

  async findById(id: string): Promise<Reminder | null> {
    const raw = await this.prisma.reminder.findFirst({ where: { id } });
    return raw ? ReminderPrismaMapper.toDomain(raw) : null;
  }

  async update(reminder: Reminder): Promise<void> {
    const data = ReminderPrismaMapper.toPersistence(reminder);
    await this.prisma.reminder.update({
      where: { id: data.id },
      data: {
        updatedByUserId: data.updatedByUserId,
        type: data.type,
        name: data.name,
        timeOfDay: data.timeOfDay,
        dosageAmount: data.dosageAmount,
        frequencyEvery: data.frequencyEvery,
        frequencyUnit: data.frequencyUnit,
        startsOn: data.startsOn,
        untilOn: data.untilOn,
        notes: data.notes,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });
  }
}
