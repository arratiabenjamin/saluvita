import { MedicalHistoryEntry } from './medical-history-entry.entity';
import { MedicalHistoryAttachment } from './medical-history-attachment.entity';
import { MedicalHistorySourceEnum } from '../enums/medical-history-source.enum';
import { MedicalHistoryTypeEnum } from '../enums/medical-history-type.enum';
import {
  MedicalHistoryEntryNotFoundError,
  MedicalHistoryAttachmentNotFoundError,
  MedicalHistoryEntryPatientMismatchError,
  InvalidAttachmentFileError,
} from '../errors/medical-history-domain.errors';

function makeEntryProps() {
  return {
    id: 'entry-1',
    patientId: 'patient-1',
    source: MedicalHistorySourceEnum.MANUAL,
    type: MedicalHistoryTypeEnum.DIAGNOSIS,
    title: 'Hypertension',
    description: 'Elevated blood pressure',
    occurredAt: new Date('2026-07-01'),
    createdByUserId: 'user-1',
  };
}

describe('MedicalHistoryEntry entity', () => {
  describe('create', () => {
    it('creates entry with all required fields', () => {
      const entry = MedicalHistoryEntry.create(makeEntryProps());

      expect(entry.id).toBe('entry-1');
      expect(entry.patientId).toBe('patient-1');
      expect(entry.source).toBe(MedicalHistorySourceEnum.MANUAL);
      expect(entry.type).toBe(MedicalHistoryTypeEnum.DIAGNOSIS);
      expect(entry.title).toBe('Hypertension');
      expect(entry.description).toBe('Elevated blood pressure');
      expect(entry.createdByUserId).toBe('user-1');
      expect(entry.createdAt).toBeDefined();
      expect(entry.updatedAt).toBeDefined();
    });

    it('creates entry without description', () => {
      const entry = MedicalHistoryEntry.create({ ...makeEntryProps(), description: undefined });
      expect(entry.description).toBeUndefined();
    });

    it('creates entry with appointmentId', () => {
      const entry = MedicalHistoryEntry.create({ ...makeEntryProps(), appointmentId: 'appt-1' });
      expect(entry.appointmentId).toBe('appt-1');
    });
  });

  describe('rehydrate', () => {
    it('rehydrates entry from persistence', () => {
      const now = new Date();
      const entry = MedicalHistoryEntry.rehydrate({
        ...makeEntryProps(),
        updatedByUserId: 'user-2',
        createdAt: now,
        updatedAt: now,
      });

      expect(entry.updatedByUserId).toBe('user-2');
      expect(entry.createdAt).toEqual(now);
    });
  });

  describe('update', () => {
    it('updates type', () => {
      const entry = MedicalHistoryEntry.create(makeEntryProps());
      entry.update({ type: MedicalHistoryTypeEnum.PRESCRIPTION }, 'user-2');
      expect(entry.type).toBe(MedicalHistoryTypeEnum.PRESCRIPTION);
      expect(entry.updatedByUserId).toBe('user-2');
    });

    it('updates title when non-empty', () => {
      const entry = MedicalHistoryEntry.create(makeEntryProps());
      entry.update({ title: '  New Title  ' }, 'user-2');
      expect(entry.title).toBe('New Title');
    });

    it('does not update title when empty string', () => {
      const entry = MedicalHistoryEntry.create(makeEntryProps());
      entry.update({ title: '' }, 'user-2');
      expect(entry.title).toBe('Hypertension'); // unchanged
    });

    it('clears description when empty string', () => {
      const entry = MedicalHistoryEntry.create(makeEntryProps());
      entry.update({ description: '' }, 'user-2');
      expect(entry.description).toBeUndefined();
    });

    it('sets description when non-empty', () => {
      const entry = MedicalHistoryEntry.create({ ...makeEntryProps(), description: undefined });
      entry.update({ description: 'New description' }, 'user-2');
      expect(entry.description).toBe('New description');
    });

    it('updates occurredAt', () => {
      const entry = MedicalHistoryEntry.create(makeEntryProps());
      const newDate = new Date('2026-08-01');
      entry.update({ occurredAt: newDate }, 'user-2');
      expect(entry.occurredAt).toEqual(newDate);
    });
  });
});

describe('MedicalHistoryAttachment entity', () => {
  const baseAttachmentProps = {
    id: 'att-1',
    entryId: 'entry-1',
    fileName: 'report.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 1024 * 100,
    s3Bucket: 'test-bucket',
    s3Key: 'medical-history/patient-1/entry-1/uuid-report.pdf',
    uploadedByUserId: 'user-1',
  };

  it('creates attachment with all fields', () => {
    const att = MedicalHistoryAttachment.create(baseAttachmentProps);

    expect(att.id).toBe('att-1');
    expect(att.entryId).toBe('entry-1');
    expect(att.fileName).toBe('report.pdf');
    expect(att.fileMimeType).toBe('application/pdf');
    expect(att.fileSizeBytes).toBe(1024 * 100);
    expect(att.s3Bucket).toBe('test-bucket');
    expect(att.s3Key).toBe('medical-history/patient-1/entry-1/uuid-report.pdf');
    expect(att.uploadedByUserId).toBe('user-1');
    expect(att.createdAt).toBeDefined();
  });

  it('rehydrates attachment from persistence', () => {
    const now = new Date();
    const att = MedicalHistoryAttachment.rehydrate({ ...baseAttachmentProps, createdAt: now });
    expect(att.createdAt).toEqual(now);
    expect(att.s3Bucket).toBe('test-bucket');
  });
});

describe('medical-history domain errors', () => {
  it('MedicalHistoryEntryNotFoundError carries id', () => {
    const err = new MedicalHistoryEntryNotFoundError('entry-123');
    expect(err.message).toContain('entry-123');
    expect(err.name).toBe('MedicalHistoryEntryNotFoundError');
  });

  it('MedicalHistoryAttachmentNotFoundError carries id', () => {
    const err = new MedicalHistoryAttachmentNotFoundError('att-123');
    expect(err.message).toContain('att-123');
    expect(err.name).toBe('MedicalHistoryAttachmentNotFoundError');
  });

  it('MedicalHistoryEntryPatientMismatchError has message', () => {
    const err = new MedicalHistoryEntryPatientMismatchError();
    expect(err.message).toBeTruthy();
    expect(err.name).toBe('MedicalHistoryEntryPatientMismatchError');
  });

  it('InvalidAttachmentFileError carries custom message', () => {
    const err = new InvalidAttachmentFileError('file too large');
    expect(err.message).toBe('file too large');
    expect(err.name).toBe('InvalidAttachmentFileError');
  });
});
