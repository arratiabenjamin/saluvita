import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from '../../../../shared/auth/roles.constants';
import type { ReminderAccessService } from '../../application/ports/reminder-access.service';
import type { ActorContext } from '../../application/ports/actor-context';
import type { ReminderListScope } from '../../application/ports/reminder-query.service';

@Injectable()
export class PrismaReminderAccessService implements ReminderAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureCanManagePatient(actor: ActorContext, patientId: string): Promise<void> {
    if (actor.roles.includes(ROLE_ADMIN)) return;

    if (actor.roles.includes(ROLE_PATIENT)) {
      if (!actor.patientId) throw new ForbiddenException('Authenticated patient has no patientId');
      if (actor.patientId !== patientId) throw new ForbiddenException('You can only manage your own reminders');
      return;
    }

    if (actor.roles.includes(ROLE_CAREGIVER)) {
      const link = await this.prisma.patientGuardian.findFirst({
        where: {
          patientId,
          guardianUserId: actor.userId,
          isActive: true,
          canManageAppointments: true,
          patient: { deletedAt: null, isActive: true },
        },
      });

      if (!link) throw new ForbiddenException('No reminder permissions for this patient');
      return;
    }

    throw new ForbiddenException('Insufficient role permissions');
  }

  async ensureCanReadReminder(actor: ActorContext, reminderId: string): Promise<void> {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id: reminderId },
      select: { id: true, patientId: true },
    });

    if (!reminder) throw new NotFoundException('Reminder not found');

    await this.ensureCanManagePatient(actor, reminder.patientId);
  }

  async ensureCanManageReminder(actor: ActorContext, reminderId: string): Promise<void> {
    await this.ensureCanReadReminder(actor, reminderId);
  }

  async resolveListScope(actor: ActorContext): Promise<ReminderListScope> {
    if (actor.roles.includes(ROLE_ADMIN)) return { mode: 'all' };

    if (actor.roles.includes(ROLE_PATIENT)) {
      if (!actor.patientId) throw new ForbiddenException('Authenticated patient has no patientId');
      return { mode: 'patients', patientIds: [actor.patientId] };
    }

    if (actor.roles.includes(ROLE_CAREGIVER)) {
      const links = await this.prisma.patientGuardian.findMany({
        where: {
          guardianUserId: actor.userId,
          isActive: true,
          canManageAppointments: true,
          patient: { deletedAt: null, isActive: true },
        },
        select: { patientId: true },
      });

      return { mode: 'patients', patientIds: links.map((l) => l.patientId) };
    }

    throw new ForbiddenException('Insufficient role permissions');
  }
}
