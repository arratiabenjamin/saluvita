import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import type { AuthenticatedUser } from '../../../shared/auth/interfaces/authenticated-user.interface';
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from '../../../shared/auth/roles.constants';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(actor: AuthenticatedUser, explicitPatientId?: string) {
    const patientIds = await this.resolvePatientIds(actor, explicitPatientId);

    if (!patientIds.length) {
      return {
        data: {
          quickSummary: {
            upcomingAppointmentsCount: 0,
            todayPendingRemindersCount: 0,
            completedThisWeekCount: 0,
            alertsCount: 0,
            overallStatus: 'OK',
          },
          upcomingAppointments: [],
          recentDiagnostics: [],
          healthSummary: {
            nextControlText: 'Sin próximos controles',
            observation: 'Aún no hay datos clínicos suficientes.',
            stable: true,
          },
        },
      };
    }

    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);

    const endToday = new Date(startToday);
    endToday.setDate(endToday.getDate() + 1);
    endToday.setMilliseconds(-1);

    const startWeek = new Date(now);
    startWeek.setDate(startWeek.getDate() - 7);

    const [upcomingAppointments, diagnostics, activeReminders, todayLogs, weekReminderCompletedCount, weekAppointmentsCompletedCount] =
      await Promise.all([
        this.prisma.appointment.findMany({
          where: {
            patientId: { in: patientIds },
            status: 'PLANNED',
            startsAt: { gte: now },
          },
          orderBy: { startsAt: 'asc' },
          take: 3,
          select: {
            id: true,
            patientId: true,
            startsAt: true,
            status: true,
            doctorName: true,
            specialty: true,
            facilityName: true,
          },
        }),
        this.prisma.appointment.findMany({
          where: {
            patientId: { in: patientIds },
            status: 'COMPLETED',
            OR: [{ diagnosis: { not: null } }, { conclusion: { not: null } }],
          },
          orderBy: { updatedAt: 'desc' },
          take: 3,
          select: {
            id: true,
            updatedAt: true,
            diagnosis: true,
            conclusion: true,
            doctorName: true,
            specialty: true,
          },
        }),
        this.prisma.reminder.findMany({
          where: {
            patientId: { in: patientIds },
            isActive: true,
            startsOn: { lte: endToday },
            OR: [{ untilOn: null }, { untilOn: { gte: startToday } }],
          },
          select: {
            id: true,
            patientId: true,
            startsOn: true,
            untilOn: true,
            timeOfDay: true,
          },
        }),
        this.prisma.reminderLog.findMany({
          where: {
            patientId: { in: patientIds },
            scheduledFor: { gte: startToday, lte: endToday },
          },
          select: {
            reminderId: true,
            scheduledFor: true,
            status: true,
          },
        }),
        this.prisma.reminderLog.count({
          where: {
            patientId: { in: patientIds },
            status: 'COMPLETED',
            scheduledFor: { gte: startWeek, lte: now },
          },
        }),
        this.prisma.appointment.count({
          where: {
            patientId: { in: patientIds },
            status: 'COMPLETED',
            updatedAt: { gte: startWeek, lte: now },
          },
        }),
      ]);

    const todayOccurrences = this.buildTodayOccurrences(activeReminders, startToday, endToday);
    const todayLogMap = new Map(
      todayLogs.map((log) => [`${log.reminderId}:${log.scheduledFor.toISOString()}`, log.status]),
    );

    const pendingToday = todayOccurrences.filter((occ) => !todayLogMap.has(`${occ.reminderId}:${occ.scheduledFor.toISOString()}`) || todayLogMap.get(`${occ.reminderId}:${occ.scheduledFor.toISOString()}`) === 'PENDING').length;

    const pastDueAlerts = todayOccurrences.filter((occ) => {
      if (occ.scheduledFor > now) return false;
      const status = todayLogMap.get(`${occ.reminderId}:${occ.scheduledFor.toISOString()}`);
      return !status || status === 'PENDING';
    }).length;

    const upcomingAppointmentsCount = await this.prisma.appointment.count({
      where: {
        patientId: { in: patientIds },
        status: 'PLANNED',
        startsAt: { gte: now },
      },
    });

    const completedThisWeekCount = weekReminderCompletedCount + weekAppointmentsCompletedCount;
    const alertsCount = pastDueAlerts;

    const recentDiagnostics = diagnostics.map((item) => ({
      id: item.id,
      title: item.diagnosis ?? 'Diagnóstico registrado',
      description: item.conclusion ?? 'Sin conclusión registrada',
      date: item.updatedAt,
      doctorName: item.doctorName,
      specialty: item.specialty,
    }));

    const nextAppointment = upcomingAppointments[0];

    return {
      data: {
        quickSummary: {
          upcomingAppointmentsCount,
          todayPendingRemindersCount: pendingToday,
          completedThisWeekCount,
          alertsCount,
          overallStatus: alertsCount > 0 ? 'ATTENTION' : 'OK',
        },
        upcomingAppointments,
        recentDiagnostics,
        healthSummary: {
          nextControlText: nextAppointment
            ? `${nextAppointment.startsAt.toISOString()} · ${nextAppointment.specialty ?? 'Control médico'}`
            : 'Sin próximos controles',
          observation: recentDiagnostics[0]?.description ?? 'Sin observaciones recientes.',
          stable: alertsCount === 0,
        },
      },
    };
  }

  private buildTodayOccurrences(
    reminders: Array<{ id: string; patientId: string; startsOn: Date; untilOn: Date | null; timeOfDay: string }>,
    startToday: Date,
    endToday: Date,
  ) {
    return reminders
      .map((reminder) => {
        const [hour, minute] = reminder.timeOfDay.split(':').map(Number);
        const scheduledFor = new Date(startToday);
        scheduledFor.setHours(hour, minute, 0, 0);

        const startsOnDay = new Date(reminder.startsOn);
        startsOnDay.setHours(0, 0, 0, 0);

        const untilOnDay = reminder.untilOn ? new Date(reminder.untilOn) : null;
        if (untilOnDay) untilOnDay.setHours(23, 59, 59, 999);

        if (scheduledFor < startsOnDay) return null;
        if (untilOnDay && scheduledFor > untilOnDay) return null;
        if (scheduledFor < startToday || scheduledFor > endToday) return null;

        return {
          reminderId: reminder.id,
          patientId: reminder.patientId,
          scheduledFor,
        };
      })
      .filter((x): x is { reminderId: string; patientId: string; scheduledFor: Date } => Boolean(x));
  }

  private async resolvePatientIds(actor: AuthenticatedUser, explicitPatientId?: string): Promise<string[]> {
    if (actor.roles.includes(ROLE_ADMIN)) {
      if (explicitPatientId) return [explicitPatientId];
      const rows = await this.prisma.patient.findMany({
        where: { deletedAt: null, isActive: true },
        select: { id: true },
        take: 500,
      });
      return rows.map((r) => r.id);
    }

    if (actor.roles.includes(ROLE_PATIENT)) {
      if (!actor.patientId) throw new ForbiddenException('Authenticated patient has no patientId');
      if (explicitPatientId && explicitPatientId !== actor.patientId) {
        throw new ForbiddenException('You can only access your own dashboard');
      }
      return [actor.patientId];
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

      const ids = links.map((l) => l.patientId);
      if (explicitPatientId && !ids.includes(explicitPatientId)) {
        throw new ForbiddenException('No dashboard access for this patient');
      }

      return explicitPatientId ? [explicitPatientId] : ids;
    }

    throw new ForbiddenException('Insufficient role permissions');
  }
}
