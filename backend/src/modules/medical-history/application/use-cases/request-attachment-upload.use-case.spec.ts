import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RequestAttachmentUploadUseCase } from './request-attachment-upload.use-case';
import { MedicalHistoryRepository } from '../ports/medical-history.repository';
import { MedicalHistoryAccessService } from '../ports/medical-history-access.service';
import { ActorContext } from '../ports/actor-context';
import { MedicalHistoryEntry } from '../../domain/entities/medical-history-entry.entity';
import { MedicalHistorySourceEnum } from '../../domain/enums/medical-history-source.enum';
import { MedicalHistoryTypeEnum } from '../../domain/enums/medical-history-type.enum';
import { StorageService } from '../../../storage/application/ports/storage.service';
import { ConfigService } from '@nestjs/config';

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

function makeUploadResult() {
  return {
    url: 'https://s3.example.com/upload',
    method: 'PUT' as const,
    headers: {},
    expiresAt: new Date(Date.now() + 3600 * 1000),
    bucket: 'test-bucket',
    key: 'medical-history/patient-1/entry-1/uuid-file.pdf',
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
    generateUploadUrl: jest.fn().mockResolvedValue(makeUploadResult()),
    generateDownloadUrl: jest.fn(),
    deleteObject: jest.fn(),
    buildObjectKey: jest.fn().mockImplementation((parts: string[]) => parts.join('/')),
    getBucket: jest.fn().mockReturnValue('test-bucket'),
  };

  const configService = {
    get: jest.fn().mockReturnValue('10485760'), // 10 MB
  } as unknown as ConfigService;

  const sut = new RequestAttachmentUploadUseCase(repo, accessService, storage, configService);
  return { sut, repo, accessService, storage };
}

describe('RequestAttachmentUploadUseCase', () => {
  it('happy path: returns upload URL data for a valid PDF', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());
    const params = { fileName: 'report.pdf', mimeType: 'application/pdf', sizeBytes: 1024 * 50 };

    const result = await sut.execute('patient-1', 'entry-1', params, makeActor());

    expect(result.data).toHaveProperty('uploadUrl');
    expect(result.data).toHaveProperty('method', 'PUT');
    expect(result.data).toHaveProperty('expiresAt');
  });

  it('not found: throws NotFoundException when entry does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(null);

    await expect(
      sut.execute('patient-1', 'entry-999', { fileName: 'f.pdf', mimeType: 'application/pdf', sizeBytes: 100 }, makeActor()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('not found: throws NotFoundException when entry belongs to different patient', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry('wrong-patient'));

    await expect(
      sut.execute('patient-1', 'entry-1', { fileName: 'f.pdf', mimeType: 'application/pdf', sizeBytes: 100 }, makeActor()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('bad request: throws BadRequestException for disallowed MIME type', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());

    await expect(
      sut.execute('patient-1', 'entry-1', { fileName: 'file.exe', mimeType: 'application/octet-stream', sizeBytes: 100 }, makeActor()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('bad request: throws BadRequestException when sizeBytes exceeds max', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());

    await expect(
      sut.execute('patient-1', 'entry-1', { fileName: 'big.pdf', mimeType: 'application/pdf', sizeBytes: 999_999_999 }, makeActor()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('bad request: throws BadRequestException when sizeBytes is 0', async () => {
    const { sut, repo } = makeSut();
    repo.findEntryById.mockResolvedValueOnce(makeEntry());

    await expect(
      sut.execute('patient-1', 'entry-1', { fileName: 'empty.pdf', mimeType: 'application/pdf', sizeBytes: 0 }, makeActor()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
