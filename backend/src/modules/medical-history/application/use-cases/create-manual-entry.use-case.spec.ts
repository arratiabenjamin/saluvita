import { CreateManualEntryUseCase } from './create-manual-entry.use-case';
import { MedicalHistoryRepository } from '../ports/medical-history.repository';
import { MedicalHistoryAccessService } from '../ports/medical-history-access.service';
import { ActorContext } from '../ports/actor-context';
import { MedicalHistoryTypeEnum } from '../../domain/enums/medical-history-type.enum';

function makeActor(): ActorContext {
  return { userId: 'user-1', email: 'user@test.com', roles: ['PROFESSIONAL'] };
}

function makeCommand() {
  return {
    patientId: 'patient-1',
    type: MedicalHistoryTypeEnum.DIAGNOSIS,
    title: 'Hypertension',
    description: 'Patient has hypertension',
    occurredAt: new Date('2026-07-01'),
  };
}

function makeSut() {
  const repo: jest.Mocked<MedicalHistoryRepository> = {
    saveEntry: jest.fn().mockResolvedValue(undefined),
    saveEntriesBatch: jest.fn().mockResolvedValue(undefined),
    findEntryById: jest.fn(),
    updateEntry: jest.fn().mockResolvedValue(undefined),
    deleteEntry: jest.fn(),
    listEntries: jest.fn(),
    saveAttachment: jest.fn().mockResolvedValue(undefined),
    findAttachmentById: jest.fn(),
    listAttachmentsByEntry: jest.fn(),
    deleteAttachment: jest.fn().mockResolvedValue(undefined),
  };

  const accessService: jest.Mocked<MedicalHistoryAccessService> = {
    ensureCanReadPatientHistory: jest.fn().mockResolvedValue(undefined),
    ensureCanWritePatientHistory: jest.fn().mockResolvedValue(undefined),
  };

  const sut = new CreateManualEntryUseCase(repo, accessService);
  return { sut, repo, accessService };
}

describe('CreateManualEntryUseCase', () => {
  it('happy path: saves entry and returns id', async () => {
    const { sut, repo, accessService } = makeSut();

    const result = await sut.execute(makeCommand(), makeActor());

    expect(accessService.ensureCanWritePatientHistory).toHaveBeenCalledWith(makeActor(), 'patient-1');
    expect(repo.saveEntry).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
  });

  it('access denied: does not save when write access is denied', async () => {
    const { sut, repo, accessService } = makeSut();
    accessService.ensureCanWritePatientHistory.mockRejectedValueOnce(new Error('Access denied'));

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toThrow('Access denied');
    expect(repo.saveEntry).not.toHaveBeenCalled();
  });

  it('trims whitespace from title and description', async () => {
    const { sut, repo } = makeSut();
    const command = { ...makeCommand(), title: '  Trimmed Title  ', description: '  Trimmed desc  ' };

    await sut.execute(command, makeActor());

    const savedEntry = (repo.saveEntry as jest.Mock).mock.calls[0][0];
    expect(savedEntry.title).toBe('Trimmed Title');
  });
});
