import { NotFoundException } from '@nestjs/common';
import { GetReminderByIdUseCase } from './get-reminder-by-id.use-case';
import { ReminderRepository } from '../ports/reminder.repository';
import { ReminderAccessService } from '../ports/reminder-access.service';
import { ActorContext } from '../ports/actor-context';
import { Reminder } from '../../domain/entities/reminder.entity';
import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';
import { ReminderFrequencyUnitEnum } from '../../domain/enums/reminder-frequency-unit.enum';

function makeActor(): ActorContext {
  return { userId: 'user-1', roles: ['PROFESSIONAL'] };
}

function makeReminder(): Reminder {
  return Reminder.create({
    id: 'rem-1',
    patientId: 'patient-1',
    createdByUserId: 'user-1',
    type: ReminderTypeEnum.GENERAL,
    name: 'Take vitamins',
    timeOfDay: '08:00',
    frequencyEvery: 1,
    frequencyUnit: ReminderFrequencyUnitEnum.DAYS,
    startsOn: new Date('2026-07-01'),
  });
}

function makeSut() {
  const repo: jest.Mocked<ReminderRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  const access: jest.Mocked<ReminderAccessService> = {
    ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
    ensureCanReadReminder: jest.fn().mockResolvedValue(undefined),
    ensureCanManageReminder: jest.fn().mockResolvedValue(undefined),
    resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' }),
  };

  const sut = new GetReminderByIdUseCase(repo, access);
  return { sut, repo, access };
}

describe('GetReminderByIdUseCase', () => {
  it('happy path: returns reminder when found', async () => {
    const { sut, repo } = makeSut();
    const reminder = makeReminder();
    repo.findById.mockResolvedValueOnce(reminder);

    const result = await sut.execute('rem-1', makeActor());

    expect(result).toBe(reminder);
    expect(repo.findById).toHaveBeenCalledWith('rem-1');
  });

  it('not found: throws NotFoundException when reminder does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValueOnce(null);

    await expect(sut.execute('rem-999', makeActor())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('access guard rejection: does not call repo when read access denied', async () => {
    const { sut, repo, access } = makeSut();
    const guardError = new Error('Access denied');
    access.ensureCanReadReminder.mockRejectedValueOnce(guardError);

    await expect(sut.execute('rem-1', makeActor())).rejects.toThrow(guardError);
    expect(repo.findById).not.toHaveBeenCalled();
  });
});
