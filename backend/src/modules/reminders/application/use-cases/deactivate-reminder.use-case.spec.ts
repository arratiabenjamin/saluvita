import { NotFoundException } from '@nestjs/common';
import { DeactivateReminderUseCase } from './deactivate-reminder.use-case';
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
    name: 'Exercise',
    timeOfDay: '07:00',
    frequencyEvery: 1,
    frequencyUnit: ReminderFrequencyUnitEnum.DAYS,
    startsOn: new Date('2026-07-01'),
    isActive: true,
  });
}

function makeSut() {
  const repo: jest.Mocked<ReminderRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  };

  const access: jest.Mocked<ReminderAccessService> = {
    ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
    ensureCanReadReminder: jest.fn().mockResolvedValue(undefined),
    ensureCanManageReminder: jest.fn().mockResolvedValue(undefined),
    resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' }),
  };

  const sut = new DeactivateReminderUseCase(repo, access);
  return { sut, repo, access };
}

describe('DeactivateReminderUseCase', () => {
  it('happy path: deactivates reminder and returns id', async () => {
    const { sut, repo } = makeSut();
    const reminder = makeReminder();
    repo.findById.mockResolvedValueOnce(reminder);

    const result = await sut.execute('rem-1', makeActor());

    expect(result).toEqual({ id: 'rem-1' });
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(reminder.isActive).toBe(false);
  });

  it('not found: throws NotFoundException when reminder does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValueOnce(null);

    await expect(sut.execute('rem-999', makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
