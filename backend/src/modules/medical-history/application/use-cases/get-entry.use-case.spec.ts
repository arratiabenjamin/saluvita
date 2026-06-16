import { NotFoundException } from '@nestjs/common';
import { GetEntryUseCase } from './get-entry.use-case';
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

function makeSut() {
  const repo: jest.Mocked<MedicalHistoryRepository> = {
    saveEntry: jest.fn(),
    saveEntriesBatch: jest.fn(),
    findEntryById: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
    listEntries: jest.fn(),
    saveAttachment: jest.fn(),
    findAttachmentById: jest.fn(),
    listAttachmentsByEntry: jest.fn().mockResolvedValue([]),
    deleteAttachment: jest.fn(),
  };

  const accessService: jest.Mocked<MedicalHistoryAccessService> = {
    ensureCanReadPatientHistory: jest.fn().mockResolvedValue(undefined),
    ensureCanWritePatientHistory: jest.fn().mockResolvedValue(undefined),
  };

  const sut = new GetEntryUseCase(repo, accessService);
  return { sut, repo, accessService };
}

describe('GetEntryUseCase', () => {
  it('happy path: returns entry with attachments', async () => {
    const { sut, repo } = makeSut();
    const entry = makeEntry();
    repo.findEntryById.mockResolvedValueOnce(entry);

    const result = await sut.execute('patient-1', 'entry-1', makeActor());

    expect(result.data).toHaveProperty('id', 'entry-1');
    expect(result.data).toHaveProperty('attachments');
    expect(repo.listAttachmentsByEntry).toHaveBeenCalledWith('entry-1');
  });

  it('not found: throws NotFoundException when entry does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(null);

    await expect(sut.execute('patient-1', 'entry-999', makeActor())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('not found: throws NotFoundException when entry belongs to different patient', async () => {
    const { sut, repo } = makeSut();
    const entryOtherPatient = makeEntry('other-patient');
    repo.findEntryById.mockResolvedValueOnce(entryOtherPatient);

    await expect(sut.execute('patient-1', 'entry-1', makeActor())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('access denied: does not fetch entry when read access is denied', async () => {
    const { sut, repo, accessService } = makeSut();
    accessService.ensureCanReadPatientHistory.mockRejectedValueOnce(new Error('Access denied'));

    await expect(sut.execute('patient-1', 'entry-1', makeActor())).rejects.toThrow('Access denied');
    expect(repo.findEntryById).not.toHaveBeenCalled();
  });
});
