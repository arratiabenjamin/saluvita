import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from '../../../shared/auth/roles.constants';
import type { AuthenticatedUser } from '../../../shared/auth/interfaces/authenticated-user.interface';
import { SchedulesViewEnum } from '../presentation/dto/schedules-overview-query.dto';

type ReminderEventItem = {
  eventId: string;
  reminderId: string;
  patientId: string;
  scheduledFor: string;
  dayLabel: string;
  time: string;
  title: string;
  location: string;
  type: 'medicamento' | 'recordatorio' | 'examen';
  status: 'pendiente' | 'completada' | 'cancelada';
  actionLabel: string;
  dosageAmount?: string;
  notes?: string;
};

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(view: SchedulesViewEnum, actor: AuthenticatedUser, explicitPatientId?: string) {
    const patientScope = await this.resolvePatientScope(actor, explicitPatientId);
    const range = this.resolveRange(view);

    const reminders = await this.prisma.reminder.findMany({
      where: {
        patientId: { in: patientScope.patientIds },
        isActive: true,
        startsOn: { lte: range.to },
        OR: [{ untilOn: null }, { untilOn: { gte: range.from } }],
      },
      include: {
        patient: {
          select: {
            id: true,
            timezone: true,
          },
        },
      },
      orderBy: [{ timeOfDay: 'asc' }, { createdAt: 'desc' }],
    });

    const eventsRaw: Array<{
      reminderId: string;
      patientId: string;
      scheduledFor: Date;
      name: string;
      type: string;
      dosageAmount: string | null;
      notes: string | null;
      timezone: string;
    }> = [];

    for (const reminder of reminders) {
      const occurrences = this.generateOccurrences(reminder, range.from, range.to);
      for (const occurrence of occurrences) {
        eventsRaw.push({
          reminderId: reminder.id,
          patientId: reminder.patientId,
          scheduledFor: occurrence,
          name: reminder.name,
          type: reminder.type,
          dosageAmount: reminder.dosageAmount,
          notes: reminder.notes,
          timezone: reminder.patient.timezone,
        });
      }
    }

    const logLookup = await this.findLogsForEvents(eventsRaw);
    const now = new Date();

    const events: ReminderEventItem[] = eventsRaw
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
      .map((event) => {
        const log = logLookup.get(`${event.reminderId}:${event.scheduledFor.toISOString()}`);
        const status = this.resolveStatus(log?.status, event.scheduledFor, now);

        const formattedTime = this.formatTime(event.scheduledFor, event.timezone);
        const dayLabel = this.formatDayLabel(event.scheduledFor, event.timezone);

        return {
          eventId: `${event.reminderId}-${event.scheduledFor.toISOString()}`,
          reminderId: event.reminderId,
          patientId: event.patientId,
          scheduledFor: event.scheduledFor.toISOString(),
          dayLabel,
          time: formattedTime,
          title: event.name,
          location: 'Rutina personal',
          type: this.mapType(event.type),
          status,
          actionLabel: status === 'completada' ? 'Ver detalle' : 'Marcar completado',
          dosageAmount: event.dosageAmount ?? undefined,
          notes: event.notes ?? undefined,
        };
      });

    const nextEvent = events.find((e) => new Date(e.scheduledFor) >= now) ?? events[0] ?? null;

    const daySummary = {
      total: events.length,
      pending: events.filter((e) => e.status === 'pendiente').length,
      completed: events.filter((e) => e.status === 'completada').length,
      cancelled: events.filter((e) => e.status === 'cancelada').length,
    };

    const miniCalendarWeek = this.buildMiniCalendarWeek(events, patientScope.timezone);

    return {
      data: {
        view,
        timezone: patientScope.timezone,
        range: { from: range.from.toISOString(), to: range.to.toISOString() },
        nextEvent,
        events,
        daySummary,
        miniCalendarWeek,
      },
    };
  }

  private resolveRange(view: SchedulesViewEnum): { from: Date; to: Date } {
    const now = new Date();
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);

    if (view === SchedulesViewEnum.TODAY) {
      to.setDate(to.getDate() + 1);
      to.setMilliseconds(-1);
      return { from, to };
    }

    if (view === SchedulesViewEnum.WEEK) {
      to.setDate(to.getDate() + 7);
      to.setMilliseconds(-1);
      return { from, to };
    }

    to.setDate(to.getDate() + 30);
    to.setMilliseconds(-1);
    return { from, to };
  }

  private generateOccurrences(reminder: any, from: Date, to: Date): Date[] {
    const [hour, minute] = reminder.timeOfDay.split(':').map(Number);
    const startDate = new Date(reminder.startsOn);
    const limitStart = from > startDate ? from : startDate;
    const limitEnd = reminder.untilOn && reminder.untilOn < to ? reminder.untilOn : to;

    if (limitEnd < limitStart) return [];

    const occurrences: Date[] = [];

    if (reminder.frequencyUnit === 'HOURS') {
      const cursor = new Date(startDate);
      cursor.setHours(hour, minute, 0, 0);
      while (cursor <= limitEnd) {
        if (cursor >= limitStart) occurrences.push(new Date(cursor));
        cursor.setHours(cursor.getHours() + reminder.frequencyEvery);
      }
      return occurrences;
    }

    const cursor = new Date(limitStart);
    cursor.setHours(hour, minute, 0, 0);

    while (cursor <= limitEnd) {
      const daysDiff = Math.floor((this.startOfDay(cursor).getTime() - this.startOfDay(startDate).getTime()) / (24 * 60 * 60 * 1000));

      let match = false;
      if (reminder.frequencyUnit === 'DAYS') {
        match = daysDiff >= 0 && daysDiff % reminder.frequencyEvery === 0;
      }

      if (reminder.frequencyUnit === 'WEEKS') {
        const interval = reminder.frequencyEvery * 7;
        match = daysDiff >= 0 && daysDiff % interval === 0;
      }

      if (match) occurrences.push(new Date(cursor));

      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(hour, minute, 0, 0);
    }

    return occurrences;
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private async findLogsForEvents(events: Array<{ reminderId: string; scheduledFor: Date }>) {
    const map = new Map<string, { status: string }>();
    if (!events.length) return map;

    // Optimización MVP: buscamos logs en el rango global y luego matcheamos en memoria.
    const dates = events.map((e) => e.scheduledFor.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const reminderIds = Array.from(new Set(events.map((e) => e.reminderId)));

    const logs = await this.prisma.reminderLog.findMany({
      where: {
        reminderId: { in: reminderIds },
        scheduledFor: { gte: minDate, lte: maxDate },
      },
      select: {
        reminderId: true,
        scheduledFor: true,
        status: true,
      },
    });

    for (const log of logs) {
      map.set(`${log.reminderId}:${log.scheduledFor.toISOString()}`, { status: log.status });
    }

    return map;
  }

  private resolveStatus(logStatus: string | undefined, scheduledFor: Date, now: Date): 'pendiente' | 'completada' | 'cancelada' {
    if (logStatus === 'COMPLETED') return 'completada';
    if (logStatus === 'SKIPPED') return 'cancelada';

    // Por ahora mantenemos pendiente para todos los no marcados.
    // Se puede evolucionar a “vencido” en otro estado cuando frontend lo pida.
    if (!logStatus && scheduledFor < now) return 'pendiente';

    return 'pendiente';
  }

  private mapType(type: string): 'medicamento' | 'recordatorio' | 'examen' {
    if (type === 'MEDICATION') return 'medicamento';
    if (type === 'EXAM') return 'examen';
    return 'recordatorio';
  }

  private formatTime(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).format(date);
  }

  private formatDayLabel(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: timezone,
    }).format(date);
  }

  private buildMiniCalendarWeek(events: ReminderEventItem[], timezone: string) {
    const now = new Date();
    const jsDay = now.getDay(); // 0 domingo, 1 lunes, ...
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const result: Array<{ dayLabel: string; date: string; eventsCount: number; isToday: boolean }> = [];

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateKey = date.toISOString().slice(0, 10);

      const eventsCount = events.filter((e) => e.scheduledFor.slice(0, 10) === dateKey).length;
      const isToday = now.toISOString().slice(0, 10) === dateKey;

      result.push({
        dayLabel: new Intl.DateTimeFormat('es-CL', { weekday: 'short', timeZone: timezone }).format(date),
        date: dateKey,
        eventsCount,
        isToday,
      });
    }

    return result;
  }

  private async resolvePatientScope(actor: AuthenticatedUser, explicitPatientId?: string) {
    if (actor.roles.includes(ROLE_ADMIN)) {
      return {
        patientIds: explicitPatientId ? [explicitPatientId] : await this.findAllActivePatientIds(),
        timezone: await this.resolveTimezone(explicitPatientId),
      };
    }

    if (actor.roles.includes(ROLE_PATIENT)) {
      if (!actor.patientId) throw new ForbiddenException('Authenticated patient has no patientId');
      if (explicitPatientId && explicitPatientId !== actor.patientId) {
        throw new ForbiddenException('You can only access your own schedules');
      }
      return {
        patientIds: [actor.patientId],
        timezone: await this.resolveTimezone(actor.patientId),
      };
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
        throw new ForbiddenException('No access to schedules for this patient');
      }

      const scopeIds = explicitPatientId ? [explicitPatientId] : ids;
      return {
        patientIds: scopeIds,
        timezone: await this.resolveTimezone(scopeIds[0]),
      };
    }

    throw new ForbiddenException('Insufficient role permissions');
  }

  private async findAllActivePatientIds(): Promise<string[]> {
    const rows = await this.prisma.patient.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true },
      take: 500,
    });
    return rows.map((r) => r.id);
  }

  private async resolveTimezone(patientId?: string): Promise<string> {
    if (!patientId) return 'America/Santiago';
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, deletedAt: null, isActive: true },
      select: { timezone: true },
    });
    return patient?.timezone ?? 'America/Santiago';
  }
}
