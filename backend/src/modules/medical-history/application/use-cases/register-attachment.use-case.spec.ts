import { NotFoundException } from '@nestjs/common';
import { RegisterAttachmentUseCase } from './register-attachment.use-case';
import { MedicalHistoryRepository } from '../ports/medical-history.repository';
import { MedicalHistoryAccessService } from '../ports/medical-history-access.service';
import { ActorContext } from '../ports/actor-context';
import { MedicalHistoryEntry } from '../../domain/entities/medical-history-entry.entity';
import { MedicalHistorySourceEnum } from '../../domain/enums/medical-history-source.enum';
import { MedicalHistoryTypeEnum } from '../../domain/enums/medical-history-type.enum';
import { StorageService } from '../../../storage/application/ports/storage.service';

function makeActor(): ActorContext {
  return { userId: 'user-1', email: 'user@test.com', roles: ['PROFESSIONAL'] };
}

function makeEntry(patientId = 'patient-1'): MedicalHistoryEntry {
  return MedicalHistoryEntry.create({
    id: 'entry-1',
    patientId,
    source: MedicalHistorySourceEnum.MANUAL,
    type: MedicalHistoryTypeEnum.EXAM,
    title: 'Blood test',
    occurredAt: new Date('2026-07-01'),
    createdByUserId: 'user-1',
  });
}

function makeParams() {
  return {
    key: 'medical-history/patient-1/entry-1/uuid-report.pdf',
    fileName: 'report.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024 * 100,
  };
}

function makeSut() {
  const repo: jest.Mocked<MedicalHistoryRepository> = {
    saveEntry: jest.fn(),
    saveEntriesBatch: jest.fn(),
    findEntryById: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
    listEntries: jest.fn(),
    saveAttachment: jest.fn().mockResolvedValue(undefined),
    findAttachmentById: jest.fn(),
    listAttachmentsByEntry: jest.fn(),
    deleteAttachment: jest.fn(),
  };

  const accessService: jest.Mocked<MedicalHistoryAccessService> = {
    ensureCanReadPatientHistory: jest.fn().mockResolvedValue(undefined),
    ensureCanWritePatientHistory: jest.fn().mockResolvedValue(undefined),
  };

  const storage: jest.Mocked<StorageService> = {
    generateUploadUrl: jest.fn(),
    generateDownloadUrl: jest.fn(),
    deleteObject: jest.fn(),
    buildObjectKey: jest.fn().mockImplementation((parts: string[]) => parts.join('/')),
    getBucket: jest.fn().mockReturnValue('test-bucket'),
  };

  const sut = new RegisterAttachmentUseCase(repo, accessService, storage);
  return { sut, repo, accessService, storage };
}

describe('RegisterAttachmentUseCase', () => {
  it('happy path: registers attachment and returns id', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());

    const result = await sut.execute('patient-1', 'entry-1', makeParams(), makeActor());

    expect(repo.saveAttachment).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
  });

  it('not found: throws NotFoundException when entry does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(null);

    await expect(sut.execute('patient-1', 'entry-999', makeParams(), makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.saveAttachment).not.toHaveBeenCalled();
  });

  it('not found: throws NotFoundException when entry belongs to different patient', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry('wrong-patient'));

    await expect(sut.execute('patient-1', 'entry-1', makeParams(), makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.saveAttachment).not.toHaveBeenCalled();
  });

  it('access denied: does not save attachment when write access is denied', async () => {
    const { sut, repo, accessService } = makeSut();
    accessService.ensureCanWritePatientHistory.mockRejectedValueOnce(new Error('Access denied'));

    await expect(sut.execute('patient-1', 'entry-1', makeParams(), makeActor())).rejects.toThrow('Access denied');
    expect(repo.findEntryById).not.toHaveBeenCalled();
  });
});
