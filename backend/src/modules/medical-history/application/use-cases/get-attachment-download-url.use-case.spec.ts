import { NotFoundException } from '@nestjs/common';
import { GetAttachmentDownloadUrlUseCase } from './get-attachment-download-url.use-case';
import { MedicalHistoryRepository } from '../ports/medical-history.repository';
import { MedicalHistoryAccessService } from '../ports/medical-history-access.service';
import { ActorContext } from '../ports/actor-context';
import { MedicalHistoryEntry } from '../../domain/entities/medical-history-entry.entity';
import { MedicalHistoryAttachment } from '../../domain/entities/medical-history-attachment.entity';
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

function makeAttachment(entryId = 'entry-1'): MedicalHistoryAttachment {
  return MedicalHistoryAttachment.create({
    id: 'attachment-1',
    entryId,
    fileName: 'report.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 1024 * 100,
    s3Bucket: 'test-bucket',
    s3Key: 'medical-history/patient-1/entry-1/uuid-report.pdf',
    uploadedByUserId: 'user-1',
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
    listAttachmentsByEntry: jest.fn(),
    deleteAttachment: jest.fn(),
  };

  const accessService: jest.Mocked<MedicalHistoryAccessService> = {
    ensureCanReadPatientHistory: jest.fn().mockResolvedValue(undefined),
    ensureCanWritePatientHistory: jest.fn().mockResolvedValue(undefined),
  };

  const storage: jest.Mocked<StorageService> = {
    generateUploadUrl: jest.fn(),
    generateDownloadUrl: jest.fn().mockResolvedValue({
      url: 'https://s3.example.com/download-url',
      expiresAt: new Date(Date.now() + 3600 * 1000),
    }),
    deleteObject: jest.fn(),
    buildObjectKey: jest.fn().mockImplementation((parts: string[]) => parts.join('/')),
    getBucket: jest.fn().mockReturnValue('test-bucket'),
  };

  const sut = new GetAttachmentDownloadUrlUseCase(repo, accessService, storage);
  return { sut, repo, accessService, storage };
}

describe('GetAttachmentDownloadUrlUseCase', () => {
  it('happy path: returns presigned download URL and metadata', async () => {
    const { sut, repo, storage } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());
    repo.findAttachmentById.mockResolvedValueOnce(makeAttachment());

    const result = await sut.execute('patient-1', 'entry-1', 'attachment-1', makeActor());

    expect(storage.generateDownloadUrl).toHaveBeenCalledWith('medical-history/patient-1/entry-1/uuid-report.pdf');
    expect(result.data).toHaveProperty('url');
    expect(result.data).toHaveProperty('fileName', 'report.pdf');
    expect(result.data).toHaveProperty('fileMimeType', 'application/pdf');
    expect(result.data).toHaveProperty('fileSizeBytes');
    expect(result.data).toHaveProperty('expiresAt');
  });

  it('not found: throws NotFoundException when entry does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(null);

    await expect(sut.execute('patient-1', 'entry-999', 'att-1', makeActor())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('not found: throws NotFoundException when entry belongs to different patient', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry('wrong-patient'));

    await expect(sut.execute('patient-1', 'entry-1', 'att-1', makeActor())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('not found: throws NotFoundException when attachment does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());
    repo.findAttachmentById.mockResolvedValueOnce(null);

    await expect(sut.execute('patient-1', 'entry-1', 'att-999', makeActor())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('not found: throws NotFoundException when attachment belongs to different entry', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());
    repo.findAttachmentById.mockResolvedValueOnce(makeAttachment('other-entry'));

    await expect(sut.execute('patient-1', 'entry-1', 'attachment-1', makeActor())).rejects.toBeInstanceOf(NotFoundException);
  });
});
