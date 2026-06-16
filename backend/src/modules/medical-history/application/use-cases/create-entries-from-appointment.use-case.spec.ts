import { CreateEntriesFromAppointmentUseCase } from './create-entries-from-appointment.use-case';
import { MedicalHistoryRepository } from '../ports/medical-history.repository';

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

  const sut = new CreateEntriesFromAppointmentUseCase(repo);
  return { sut, repo };
}

describe('CreateEntriesFromAppointmentUseCase', () => {
  it('happy path: creates entries for all provided fields', async () => {
    const { sut, repo } = makeSut();
    const snapshot = {
      id: 'appt-1',
      patientId: 'patient-1',
      startsAt: new Date('2026-07-01T10:00:00Z'),
      endsAt: new Date('2026-07-01T11:00:00Z'),
      diagnosis: 'Hypertension',
      conclusion: 'Stable condition',
      followUpNotes: 'Review in 3 months',
    };

    const result = await sut.execute(snapshot, 'user-1');

    expect(repo.saveEntriesBatch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ created: 3 });
  });

  it('no entries: returns 0 created when no diagnosis/conclusion/followUp provided', async () => {
    const { sut, repo } = makeSut();
    const snapshot = {
      id: 'appt-2',
      patientId: 'patient-1',
      startsAt: new Date('2026-07-01T10:00:00Z'),
    };

    const result = await sut.execute(snapshot, 'user-1');

    expect(repo.saveEntriesBatch).not.toHaveBeenCalled();
    expect(result).toEqual({ created: 0 });
  });

  it('partial entries: creates only entries with non-empty fields', async () => {
    const { sut, repo } = makeSut();
    const snapshot = {
      id: 'appt-3',
      patientId: 'patient-1',
      startsAt: new Date('2026-07-01T10:00:00Z'),
      diagnosis: 'Migraine',
      conclusion: '',   // empty -> skip
      followUpNotes: '  ', // whitespace only -> skip
    };

    const result = await sut.execute(snapshot, 'user-1');

    expect(result).toEqual({ created: 1 });
  });

  it('error resilience: returns 0 and does not throw when saveEntriesBatch fails', async () => {
    const { sut, repo } = makeSut();
    repo.saveEntriesBatch.mockRejectedValueOnce(new Error('DB error'));
    const snapshot = {
      id: 'appt-4',
      patientId: 'patient-1',
      startsAt: new Date('2026-07-01T10:00:00Z'),
      diagnosis: 'Headache',
    };

    const result = await sut.execute(snapshot, 'user-1');

    expect(result).toEqual({ created: 0 });
  });

  it('uses endsAt as occurredAt when provided', async () => {
    const { sut, repo } = makeSut();
    const endsAt = new Date('2026-07-01T11:00:00Z');
    const snapshot = {
      id: 'appt-5',
      patientId: 'patient-1',
      startsAt: new Date('2026-07-01T10:00:00Z'),
      endsAt,
      diagnosis: 'Test',
    };

    await sut.execute(snapshot, 'user-1');

    const savedEntries: any[] = (repo.saveEntriesBatch as jest.Mock).mock.calls[0][0];
    expect(savedEntries[0].occurredAt).toEqual(endsAt);
  });
});
