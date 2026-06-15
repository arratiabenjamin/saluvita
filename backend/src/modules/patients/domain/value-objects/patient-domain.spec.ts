import { PatientDocument } from './patient-document.vo';
import { PatientEmail } from './patient-email.vo';
import { PatientFullName } from './patient-full-name.vo';
import { PatientDocumentTypeEnum } from '../enums/patient-document-type.enum';
import {
  InvalidPatientDocumentError,
  InvalidPatientEmailError,
  PatientFirstNameRequiredError,
  PatientLastNameRequiredError,
} from '../errors/patient-domain.errors';

describe('PatientDocument VO', () => {
  it('creates valid document and normalizes to uppercase', () => {
    const doc = PatientDocument.create(PatientDocumentTypeEnum.RUT, '12345678-9');
    expect(doc.number).toBe('12345678-9');
    expect(doc.type).toBe(PatientDocumentTypeEnum.RUT);
  });

  it('trims and uppercases the number', () => {
    const doc = PatientDocument.create(PatientDocumentTypeEnum.DNI, '  abc123  ');
    expect(doc.number).toBe('ABC123');
  });

  it('throws InvalidPatientDocumentError for empty number', () => {
    expect(() => PatientDocument.create(PatientDocumentTypeEnum.DNI, '')).toThrow(InvalidPatientDocumentError);
  });

  it('throws InvalidPatientDocumentError for whitespace-only number', () => {
    expect(() => PatientDocument.create(PatientDocumentTypeEnum.DNI, '   ')).toThrow(InvalidPatientDocumentError);
  });

  it('accepts PASSPORT type', () => {
    const doc = PatientDocument.create(PatientDocumentTypeEnum.PASSPORT, 'AB123456');
    expect(doc.type).toBe(PatientDocumentTypeEnum.PASSPORT);
  });
});

describe('PatientEmail VO', () => {
  it('creates valid email normalized to lowercase', () => {
    const email = PatientEmail.create('ANA@Test.com');
    expect(email.value).toBe('ana@test.com');
  });

  it('throws InvalidPatientEmailError for missing @', () => {
    expect(() => PatientEmail.create('notanemail')).toThrow(InvalidPatientEmailError);
  });

  it('throws InvalidPatientEmailError for missing domain', () => {
    expect(() => PatientEmail.create('user@')).toThrow(InvalidPatientEmailError);
  });

  it('throws InvalidPatientEmailError for empty string', () => {
    expect(() => PatientEmail.create('')).toThrow(InvalidPatientEmailError);
  });

  it('accepts email with subdomain', () => {
    const email = PatientEmail.create('user@mail.example.com');
    expect(email.value).toBe('user@mail.example.com');
  });
});

describe('PatientFullName VO', () => {
  it('creates valid full name and trims whitespace', () => {
    const name = PatientFullName.create('  Ana  ', '  García  ');
    expect(name.firstName).toBe('Ana');
    expect(name.lastName).toBe('García');
    expect(name.full).toBe('Ana García');
  });

  it('throws PatientFirstNameRequiredError for empty first name', () => {
    expect(() => PatientFullName.create('', 'García')).toThrow(PatientFirstNameRequiredError);
  });

  it('throws PatientFirstNameRequiredError for whitespace-only first name', () => {
    expect(() => PatientFullName.create('   ', 'García')).toThrow(PatientFirstNameRequiredError);
  });

  it('throws PatientLastNameRequiredError for empty last name', () => {
    expect(() => PatientFullName.create('Ana', '')).toThrow(PatientLastNameRequiredError);
  });

  it('throws PatientLastNameRequiredError for whitespace-only last name', () => {
    expect(() => PatientFullName.create('Ana', '  ')).toThrow(PatientLastNameRequiredError);
  });
});
