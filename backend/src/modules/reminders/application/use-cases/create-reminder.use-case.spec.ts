import { BadRequestException } from '@nestjs/common';
import { CreateReminderUseCase } from './create-reminder.use-case';
import { ReminderRepository } from '../ports/reminder.repository';
import { ReminderAccessService } from '../ports/reminder-access.service';
import { ActorContext } from '../ports/actor-context';
import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';
import { ReminderFrequencyUnitEnum } from '../../domain/enums/reminder-frequency-unit.enum';

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return { userId: 'user-1', roles: ['PROFESSIONAL'], ...overrides };
}

function makeCommand() {
  return {
    patientId: 'patient-1',
    type: ReminderTypeEnum.GENERAL,
    name: 'Take vitamins',
    timeOfDay: '08:00',
    frequencyEvery: 1,
    frequencyUnit: ReminderFrequencyUnitEnum.DAYS,
    startsOn: new Date('2026-07-01'),
    isActive: true,
  };
}

function makeSut() {
  const repo: jest.Mocked<ReminderRepository> = {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  };

  const access: jest.Mocked<ReminderAccessService> = {
    ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
    ensureCanReadReminder: jest.fn().mockResolvedValue(undefined),
    ensureCanManageReminder: jest.fn().mockResolvedValue(undefined),
    resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' }),
  };

  const sut = new CreateReminderUseCase(repo, access);
  return { sut, repo, access };
}

describe('CreateReminderUseCase', () => {
  it('happy path: saves reminder and returns id', async () => {
    const { sut, repo, access } = makeSut();
    const actor = makeActor();
    const command = makeCommand();

    const result = await sut.execute(command, actor);

    expect(access.ensureCanManagePatient).toHaveBeenCalledWith(actor, command.patientId);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
  });

  it('access guard rejection: does not call repo.save when access denied', async () => {
    const { sut, repo, access } = makeSut();
    const actor = makeActor();
    const guardError = new Error('Access denied');
    access.ensureCanManagePatient.mockRejectedValueOnce(guardError);

    await expect(sut.execute(makeCommand(), actor)).rejects.toThrow(guardError);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('domain error: invalid timeOfDay throws BadRequestException', async () => {
    const { sut } = makeSut();
    const command = { ...makeCommand(), timeOfDay: '99:99' };

    await expect(sut.execute(command, makeActor())).rejects.toBeInstanceOf(BadRequestException);
  });

  it('domain error: MEDICATION type without dosageAmount throws BadRequestException', async () => {
    const { sut } = makeSut();
    const command = {
      ...makeCommand(),
      type: ReminderTypeEnum.MEDICATION,
      dosageAmount: undefined,
    };

    await expect(sut.execute(command, makeActor())).rejects.toBeInstanceOf(BadRequestException);
  });

  it('domain error: invalid date range (untilOn < startsOn) throws BadRequestException', async () => {
    const { sut } = makeSut();
    const command = {
      ...makeCommand(),
      startsOn: new Date('2026-07-10'),
      untilOn: new Date('2026-07-01'),
    };

    await expect(sut.execute(command, makeActor())).rejects.toBeInstanceOf(BadRequestException);
  });
});
