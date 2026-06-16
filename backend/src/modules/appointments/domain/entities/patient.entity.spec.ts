// This file is named patient.entity.ts but exports an Appointment class (legacy shadow entity).
// It represents the appointment-as-record pattern in the appointments bounded context.
import { Appointment as AppointmentRecord } from './patient.entity';

describe('appointments/domain/entities/patient.entity — AppointmentRecord', () => {
  const now = new Date('2026-07-01T10:00:00Z');

  describe('create', () => {
    it('creates with required fields only', () => {
      const record = AppointmentRecord.create({
        id: 'apr-1',
        patientId: 'patient-1',
        recordedByUserId: 'user-1',
        startAt: now,
      });

      expect(record.id).toBe('apr-1');
      expect(record.patientId).toBe('patient-1');
      expect(record.recordedByUserId).toBe('user-1');
      expect(record.startAt).toEqual(now);
      expect(record.reason).toBeUndefined();
    });

    it('creates with all optional fields', () => {
      const record = AppointmentRecord.create({
        id: 'apr-2',
        patientId: 'patient-1',
        recordedByUserId: 'user-1',
        startAt: now,
        reason: 'Checkup',
        facilityName: 'Clinic A',
        facilityAddress: '123 Main St',
        doctorName: 'Dr. Smith',
        specialty: 'General',
      });

      expect(record.reason).toBe('Checkup');
      expect(record.facilityName).toBe('Clinic A');
      expect(record.facilityAddress).toBe('123 Main St');
      expect(record.doctorName).toBe('Dr. Smith');
      expect(record.specialty).toBe('General');
    });

    it('throws when id is missing', () => {
      expect(() =>
        AppointmentRecord.create({ id: '', patientId: 'p-1', recordedByUserId: 'u-1', startAt: now }),
      ).toThrow('Appointment id is required');
    });

    it('throws when patientId is missing', () => {
      expect(() =>
        AppointmentRecord.create({ id: 'a-1', patientId: '', recordedByUserId: 'u-1', startAt: now }),
      ).toThrow('Patient id is required');
    });

    it('throws when recordedByUserId is missing', () => {
      expect(() =>
        AppointmentRecord.create({ id: 'a-1', patientId: 'p-1', recordedByUserId: '', startAt: now }),
      ).toThrow('Recorded by user id is required');
    });

    it('throws when startAt is missing', () => {
      expect(() =>
        AppointmentRecord.create({ id: 'a-1', patientId: 'p-1', recordedByUserId: 'u-1', startAt: null as any }),
      ).toThrow('Start date and time is required');
    });
  });

  describe('rehydrate', () => {
    it('rehydrates with all fields including timestamps', () => {
      const createdAt = new Date('2026-01-01');
      const updatedAt = new Date('2026-06-01');
      const record = AppointmentRecord.rehydrate({
        id: 'apr-3',
        patientId: 'patient-1',
        recordedByUserId: 'user-1',
        startAt: now,
        reason: 'Follow-up',
        facilityName: 'Clinic B',
        facilityAddress: '456 Elm St',
        doctorName: 'Dr. Jones',
        specialty: 'Cardiology',
        createdAt,
        updatedAt,
        deletedAt: null,
      });

      expect(record.id).toBe('apr-3');
      expect(record.createdAt).toEqual(createdAt);
      expect(record.updatedAt).toEqual(updatedAt);
      expect(record.deletedAt).toBeNull();
      expect(record.reason).toBe('Follow-up');
    });
  });

  describe('updateInfo', () => {
    it('updates only provided fields', () => {
      const record = AppointmentRecord.create({
        id: 'apr-4',
        patientId: 'p-1',
        recordedByUserId: 'u-1',
        startAt: now,
        reason: 'Old reason',
      });

      record.updateInfo({ reason: 'New reason', doctorName: 'Dr. Brown' });

      expect(record.reason).toBe('New reason');
      expect(record.doctorName).toBe('Dr. Brown');
      expect(record.facilityName).toBeUndefined(); // unchanged
    });

    it('updates all optional fields', () => {
      const record = AppointmentRecord.create({ id: 'apr-5', patientId: 'p-1', recordedByUserId: 'u-1', startAt: now });
      const newDate = new Date('2026-08-01T09:00:00Z');

      record.updateInfo({
        reason: 'R',
        facilityName: 'F',
        facilityAddress: 'A',
        doctorName: 'D',
        specialty: 'S',
        startAt: newDate,
      });

      expect(record.reason).toBe('R');
      expect(record.facilityName).toBe('F');
      expect(record.facilityAddress).toBe('A');
      expect(record.doctorName).toBe('D');
      expect(record.specialty).toBe('S');
      expect(record.startAt).toEqual(newDate);
    });
  });
});
