import { Patient } from './patient.entity';
import { PatientFullName } from '../value-objects/patient-full-name.vo';
import { PatientDocument } from '../value-objects/patient-document.vo';
import { PatientEmail } from '../value-objects/patient-email.vo';
import { PatientDocumentTypeEnum } from '../enums/patient-document-type.enum';

function makeDocument() {
  return PatientDocument.create(PatientDocumentTypeEnum.DNI, '12345678A');
}

function makeFullName() {
  return PatientFullName.create('Ana', 'García');
}

function makeEmail() {
  return PatientEmail.create('ana@test.com');
}

describe('Patient entity', () => {
  describe('create', () => {
    it('creates a valid patient without optional fields', () => {
      const patient = Patient.create({
        id: 'p-1',
        fullName: makeFullName(),
        document: makeDocument(),
      });

      expect(patient.id).toBe('p-1');
      expect(patient.email).toBeUndefined();
      expect(patient.phone).toBeUndefined();
      expect(patient.birthDate).toBeUndefined();
    });

    it('creates a valid patient with all optional fields', () => {
      const patient = Patient.create({
        id: 'p-2',
        fullName: makeFullName(),
        document: makeDocument(),
        email: makeEmail(),
        phone: '+56912345678',
        birthDate: new Date('1990-01-01'),
      });

      expect(patient.email).toBeDefined();
      expect(patient.phone).toBe('+56912345678');
      expect(patient.birthDate).toEqual(new Date('1990-01-01'));
    });

    it('throws when id is missing', () => {
      expect(() =>
        Patient.create({ id: '', fullName: makeFullName(), document: makeDocument() }),
      ).toThrow('Patient id is required');
    });

    it('throws when document is missing', () => {
      expect(() =>
        Patient.create({ id: 'p-3', fullName: makeFullName(), document: null as any }),
      ).toThrow('Patient document is required');
    });
  });

  describe('rehydrate', () => {
    it('rehydrates a patient from persistence with timestamps', () => {
      const now = new Date();
      const patient = Patient.rehydrate({
        id: 'p-4',
        fullName: makeFullName(),
        document: makeDocument(),
        email: makeEmail(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      expect(patient.id).toBe('p-4');
      expect(patient.createdAt).toEqual(now);
      expect(patient.updatedAt).toEqual(now);
    });
  });

  describe('updateInfo', () => {
    it('updates only provided fields', () => {
      const patient = Patient.create({ id: 'p-5', fullName: makeFullName(), document: makeDocument() });
      const newName = PatientFullName.create('María', 'López');

      patient.updateInfo({ fullName: newName });

      expect(patient.fullName.firstName).toBe('María');
      expect(patient.document.number).toBe('12345678A'); // unchanged
    });

    it('updates email when provided', () => {
      const patient = Patient.create({ id: 'p-6', fullName: makeFullName(), document: makeDocument() });
      const newEmail = PatientEmail.create('new@test.com');

      patient.updateInfo({ email: newEmail });

      expect(patient.email?.value).toBe('new@test.com');
    });

    it('updates phone and birthDate when provided', () => {
      const patient = Patient.create({ id: 'p-7', fullName: makeFullName(), document: makeDocument() });
      const bd = new Date('1985-06-15');

      patient.updateInfo({ phone: '+56998765432', birthDate: bd });

      expect(patient.phone).toBe('+56998765432');
      expect(patient.birthDate).toEqual(bd);
    });

    it('updates document when provided', () => {
      const patient = Patient.create({ id: 'p-8', fullName: makeFullName(), document: makeDocument() });
      const newDoc = PatientDocument.create(PatientDocumentTypeEnum.PASSPORT, 'AB123456');

      patient.updateInfo({ document: newDoc });

      expect(patient.document.number).toBe('AB123456');
      expect(patient.document.type).toBe(PatientDocumentTypeEnum.PASSPORT);
    });
  });
});
