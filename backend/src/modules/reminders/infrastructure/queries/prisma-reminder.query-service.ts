import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import type { ReminderListScope, ReminderQueryService } from '../../application/ports/reminder-query.service';
import { ListRemindersQuery } from '../../application/queries/list-reminders.query';

@Injectable()
export class PrismaReminderQueryService implements ReminderQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listPaginated(query: ListRemindersQuery, scope: ReminderListScope) {
    const { page, limit, patientId, type, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (scope.mode === 'patients') {
      if (!scope.patientIds.length) {
        return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      }
      where.patientId = { in: scope.patientIds };
    }

    if (patientId) {
      where.patientId = scope.mode === 'all' ? patientId : { in: scope.patientIds.filter((id) => id === patientId) };
    }

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.reminder.count({ where }),
      this.prisma.reminder.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isActive: 'desc' }, { timeOfDay: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          patientId: true,
          type: true,
          name: true,
          timeOfDay: true,
          dosageAmount: true,
          frequencyEvery: true,
          frequencyUnit: true,
          startsOn: true,
          untilOn: true,
          notes: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
