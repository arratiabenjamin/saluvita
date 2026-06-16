import { NotFoundException } from '@nestjs/common';
import { DeleteEntryUseCase } from './delete-entry.use-case';
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
    deleteEntry: jest.fn().mockResolvedValue({ deletedS3Keys: [] }),
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

  const storage: jest.Mocked<StorageService> = {
    generateUploadUrl: jest.fn(),
    generateDownloadUrl: jest.fn(),
    deleteObject: jest.fn().mockResolvedValue(undefined),
    buildObjectKey: jest.fn().mockImplementation((parts: string[]) => parts.join('/')),
    getBucket: jest.fn().mockReturnValue('test-bucket'),
  };

  const sut = new DeleteEntryUseCase(repo, accessService, storage);
  return { sut, repo, accessService, storage };
}

describe('DeleteEntryUseCase', () => {
  it('happy path: deletes entry with no attachments, returns 0 deletedObjects', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());
    repo.deleteEntry.mockResolvedValueOnce({ deletedS3Keys: [] });

    const result = await sut.execute('patient-1', 'entry-1', makeActor());

    expect(result).toEqual({ id: 'entry-1', deletedObjects: 0 });
    expect(repo.deleteEntry).toHaveBeenCalledWith('entry-1');
  });

  it('happy path: deletes entry with S3 attachments, returns correct deletedObjects count', async () => {
    const { sut, repo, storage } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());
    repo.deleteEntry.mockResolvedValueOnce({ deletedS3Keys: ['key/1', 'key/2'] });

    const result = await sut.execute('patient-1', 'entry-1', makeActor());

    expect(storage.deleteObject).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ id: 'entry-1', deletedObjects: 2 });
  });

  it('resilience: counts 0 for S3 objects that fail to delete (no throw)', async () => {
    const { sut, repo, storage } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());
    repo.deleteEntry.mockResolvedValueOnce({ deletedS3Keys: ['key/fail'] });
    storage.deleteObject.mockRejectedValueOnce(new Error('S3 error'));

    const result = await sut.execute('patient-1', 'entry-1', makeActor());

    expect(result).toEqual({ id: 'entry-1', deletedObjects: 0 });
  });

  it('not found: throws NotFoundException when entry does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(null);

    await expect(sut.execute('patient-1', 'entry-999', makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.deleteEntry).not.toHaveBeenCalled();
  });

  it('not found: throws NotFoundException when entry belongs to different patient', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry('wrong-patient'));

    await expect(sut.execute('patient-1', 'entry-1', makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.deleteEntry).not.toHaveBeenCalled();
  });
});
