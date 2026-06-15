import { NotFoundException } from '@nestjs/common';
import { UpdateEntryUseCase } from './update-entry.use-case';
import { MedicalHistoryRepository } from '../ports/medical-history.repository';
import { MedicalHistoryAccessService } from '../ports/medical-history-access.service';
import { ActorContext } from '../ports/actor-context';
import { MedicalHistoryEntry } from '../../domain/entities/medical-history-entry.entity';
import { MedicalHistorySourceEnum } from '../../domain/enums/medical-history-source.enum';
import { MedicalHistoryTypeEnum } from '../../domain/enums/medical-history-type.enum';

function makeActor(): ActorContext {
  return { userId: 'user-1', email: 'user@test.com', roles: ['PROFESSIONAL'] };
}

function makeEntry(patientId = 'patient-1'): MedicalHistoryEntry {
  return MedicalHistoryEntry.create({
    id: 'entry-1',
    patientId,
    source: MedicalHistorySourceEnum.MANUAL,
    type: MedicalHistoryTypeEnum.DIAGNOSIS,
    title: 'Hypertension',
    occurredAt: new Date('2026-07-01'),
    createdByUserId: 'user-1',
  });
}

function makeCommand() {
  return {
    patientId: 'patient-1',
    entryId: 'entry-1',
    title: 'Updated title',
    type: MedicalHistoryTypeEnum.PATIENT_NOTE,
  };
}

function makeSut() {
  const repo: jest.Mocked<MedicalHistoryRepository> = {
    saveEntry: jest.fn(),
    saveEntriesBatch: jest.fn(),
    findEntryById: jest.fn(),
    updateEntry: jest.fn().mockResolvedValue(undefined),
    deleteEntry: jest.fn(),
    listEntries: jest.fn(),
    saveAttachment: jest.fn(),
    findAttachmentById: jest.fn(),
    listAttachmentsByEntry: jest.fn(),
    deleteAttachment: jest.fn(),
  };

  const accessService: jest.Mocked<MedicalHistoryAccessService> = {
    ensureCanReadPatientHistory: jest.fn().mockResolvedValue(undefined),
    ensureCanWritePatientHistory: jest.fn().mockResolvedValue(undefined),
  };

  const sut = new UpdateEntryUseCase(repo, accessService);
  return { sut, repo, accessService };
}

describe('UpdateEntryUseCase', () => {
  it('happy path: updates entry and returns id', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());

    const result = await sut.execute(makeCommand(), makeActor());

    expect(repo.updateEntry).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'entry-1' });
  });

  it('not found: throws NotFoundException when entry does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(null);

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.updateEntry).not.toHaveBeenCalled();
  });

  it('not found: throws NotFoundException when entry belongs to different patient', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry('wrong-patient'));

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.updateEntry).not.toHaveBeenCalled();
  });

  it('access denied: does not update when write access is denied', async () => {
    const { sut, repo, accessService } = makeSut();
    accessService.ensureCanWritePatientHistory.mockRejectedValueOnce(new Error('Access denied'));

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toThrow('Access denied');
    expect(repo.findEntryById).not.toHaveBeenCalled();
  });
});
