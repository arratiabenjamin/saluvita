import { ListEntriesUseCase } from './list-entries.use-case';
import { MedicalHistoryRepository } from '../ports/medical-history.repository';
import { MedicalHistoryAccessService } from '../ports/medical-history-access.service';
import { ActorContext } from '../ports/actor-context';
import { MedicalHistorySourceEnum } from '../../domain/enums/medical-history-source.enum';

function makeActor(): ActorContext {
  return { userId: 'user-1', email: 'user@test.com', roles: ['PROFESSIONAL'] };
}

function makeQuery() {
  return { patientId: 'patient-1', page: 1, limit: 10 };
}

function makeListResult() {
  return {
    data: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
}

function makeSut() {
  const repo: jest.Mocked<MedicalHistoryRepository> = {
    saveEntry: jest.fn(),
    saveEntriesBatch: jest.fn(),
    findEntryById: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
    listEntries: jest.fn().mockResolvedValue(makeListResult()),
    saveAttachment: jest.fn(),
    findAttachmentById: jest.fn(),
    listAttachmentsByEntry: jest.fn(),
    deleteAttachment: jest.fn(),
  };

  const accessService: jest.Mocked<MedicalHistoryAccessService> = {
    ensureCanReadPatientHistory: jest.fn().mockResolvedValue(undefined),
    ensureCanWritePatientHistory: jest.fn().mockResolvedValue(undefined),
  };

  const sut = new ListEntriesUseCase(repo, accessService);
  return { sut, repo, accessService };
}

describe('ListEntriesUseCase', () => {
  it('happy path: returns paginated entries', async () => {
    const { sut, repo, accessService } = makeSut();

    const result = await sut.execute(makeQuery(), makeActor());

    expect(accessService.ensureCanReadPatientHistory).toHaveBeenCalledWith(makeActor(), 'patient-1');
    expect(repo.listEntries).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
  });

  it('passes source filter to repository', async () => {
    const { sut, repo } = makeSut();
    const query = { ...makeQuery(), source: MedicalHistorySourceEnum.APPOINTMENT };

    await sut.execute(query, makeActor());

    expect(repo.listEntries).toHaveBeenCalledWith(
      expect.objectContaining({ source: MedicalHistorySourceEnum.APPOINTMENT }),
    );
  });

  it('access denied: does not list entries when read access is denied', async () => {
    const { sut, repo, accessService } = makeSut();
    accessService.ensureCanReadPatientHistory.mockRejectedValueOnce(new Error('Access denied'));

    await expect(sut.execute(makeQuery(), makeActor())).rejects.toThrow('Access denied');
    expect(repo.listEntries).not.toHaveBeenCalled();
  });
});
