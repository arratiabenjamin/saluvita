import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpsertReminderLogUseCase } from './upsert-reminder-log.use-case';
import { ReminderAccessService } from '../ports/reminder-access.service';
import { ActorContext } from '../ports/actor-context';
import { ReminderLogStatusEnum } from '../../domain/enums/reminder-log-status.enum';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

// NOTE: UpsertReminderLogUseCase injects PrismaService directly (infra leak in application layer).
// We mock it as a plain object to keep tests pure.
function makePrisma(): jest.Mocked<Pick<PrismaService, 'reminder' | 'reminderLog'>> {
  return {
    reminder: {
      findFirst: jest.fn(),
    } as any,
    reminderLog: {
      upsert: jest.fn(),
    } as any,
  };
}

function makeActor(): ActorContext {
  return { userId: 'user-1', roles: ['PATIENT'] };
}

function makeCommand(overrides = {}) {
  return {
    reminderId: 'rem-1',
    scheduledFor: new Date('2026-07-05T08:00:00Z'),
    status: ReminderLogStatusEnum.COMPLETED,
    ...overrides,
  };
}

function makeReminderRow() {
  return {
    id: 'rem-1',
    patientId: 'patient-1',
    startsOn: new Date('2026-07-01'),
    untilOn: null as Date | null,
  };
}

function makeSut() {
  const prisma = makePrisma();
  const access: jest.Mocked<ReminderAccessService> = {
    ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
    ensureCanReadReminder: jest.fn().mockResolvedValue(undefined),
    ensureCanManageReminder: jest.fn().mockResolvedValue(undefined),
    resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' }),
  };

  const sut = new UpsertReminderLogUseCase(prisma as unknown as PrismaService, access);
  return { sut, prisma, access };
}

describe('UpsertReminderLogUseCase', () => {
  it('happy path: upserts a COMPLETED log and returns id', async () => {
    const { sut, prisma } = makeSut();
    (prisma.reminder.findFirst as jest.Mock).mockResolvedValueOnce(makeReminderRow());
    (prisma.reminderLog.upsert as jest.Mock).mockResolvedValueOnce({ id: 'log-1' });

    const result = await sut.execute(makeCommand(), makeActor());

    expect(result).toEqual({ id: 'log-1' });
    expect(prisma.reminderLog.upsert).toHaveBeenCalledTimes(1);
  });

  it('not found: throws NotFoundException when reminder row does not exist', async () => {
    const { sut, prisma } = makeSut();
    (prisma.reminder.findFirst as jest.Mock).mockResolvedValueOnce(null);

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.reminderLog.upsert).not.toHaveBeenCalled();
  });

  it('domain error: SKIPPED status without skipReason throws BadRequestException', async () => {
    const { sut, prisma } = makeSut();
    (prisma.reminder.findFirst as jest.Mock).mockResolvedValueOnce(makeReminderRow());
    const command = makeCommand({ status: ReminderLogStatusEnum.SKIPPED, skipReason: '' });

    await expect(sut.execute(command, makeActor())).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.reminderLog.upsert).not.toHaveBeenCalled();
  });

  it('domain error: scheduledFor before startsOn throws BadRequestException', async () => {
    const { sut, prisma } = makeSut();
    const row = { ...makeReminderRow(), startsOn: new Date('2026-08-01') };
    (prisma.reminder.findFirst as jest.Mock).mockResolvedValueOnce(row);
    const command = makeCommand({ scheduledFor: new Date('2026-07-01') });

    await expect(sut.execute(command, makeActor())).rejects.toBeInstanceOf(BadRequestException);
  });

  it('domain error: scheduledFor after untilOn throws BadRequestException', async () => {
    const { sut, prisma } = makeSut();
    const row = { ...makeReminderRow(), untilOn: new Date('2026-07-10') };
    (prisma.reminder.findFirst as jest.Mock).mockResolvedValueOnce(row);
    const command = makeCommand({ scheduledFor: new Date('2026-07-20') });

    await expect(sut.execute(command, makeActor())).rejects.toBeInstanceOf(BadRequestException);
  });
});
