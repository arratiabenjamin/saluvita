import { Reminder } from './reminder.entity';
import { ReminderTypeEnum } from '../enums/reminder-type.enum';
import { ReminderFrequencyUnitEnum } from '../enums/reminder-frequency-unit.enum';
import {
  ReminderDosageRequiredForMedicationError,
  ReminderInvalidDateRangeError,
  ReminderInvalidFrequencyError,
  ReminderInvalidTimeOfDayError,
  ReminderNameRequiredError,
} from '../errors/reminder-domain.errors';

function makeBaseProps() {
  return {
    id: 'rem-1',
    patientId: 'patient-1',
    createdByUserId: 'user-1',
    type: ReminderTypeEnum.GENERAL,
    name: 'Take vitamins',
    timeOfDay: '08:00',
    frequencyEvery: 1,
    frequencyUnit: ReminderFrequencyUnitEnum.DAYS,
    startsOn: new Date('2026-07-01'),
  };
}

describe('Reminder entity — create', () => {
  it('creates with valid props', () => {
    const r = Reminder.create(makeBaseProps());
    expect(r.id).toBe('rem-1');
    expect(r.isActive).toBe(true); // default
    expect(r.dosageAmount).toBeUndefined();
    expect(r.untilOn).toBeUndefined();
    expect(r.notes).toBeUndefined();
  });

  it('respects explicit isActive=false', () => {
    const r = Reminder.create({ ...makeBaseProps(), isActive: false });
    expect(r.isActive).toBe(false);
  });

  it('creates with optional notes and untilOn', () => {
    const r = Reminder.create({
      ...makeBaseProps(),
      notes: 'After breakfast',
      untilOn: new Date('2026-12-31'),
    });
    expect(r.notes).toBe('After breakfast');
    expect(r.untilOn).toEqual(new Date('2026-12-31'));
  });

  it('throws ReminderNameRequiredError when name is empty', () => {
    expect(() => Reminder.create({ ...makeBaseProps(), name: '' })).toThrow(ReminderNameRequiredError);
  });

  it('throws ReminderNameRequiredError when name is whitespace', () => {
    expect(() => Reminder.create({ ...makeBaseProps(), name: '   ' })).toThrow(ReminderNameRequiredError);
  });

  it('throws ReminderInvalidTimeOfDayError for bad timeOfDay format', () => {
    expect(() => Reminder.create({ ...makeBaseProps(), timeOfDay: '8:00' })).toThrow(ReminderInvalidTimeOfDayError);
    expect(() => Reminder.create({ ...makeBaseProps(), timeOfDay: '25:00' })).toThrow(ReminderInvalidTimeOfDayError);
    expect(() => Reminder.create({ ...makeBaseProps(), timeOfDay: '08:60' })).toThrow(ReminderInvalidTimeOfDayError);
  });

  it('accepts valid boundary times (00:00 and 23:59)', () => {
    expect(() => Reminder.create({ ...makeBaseProps(), timeOfDay: '00:00' })).not.toThrow();
    expect(() => Reminder.create({ ...makeBaseProps(), timeOfDay: '23:59' })).not.toThrow();
  });

  it('throws ReminderInvalidFrequencyError when frequencyEvery is 0', () => {
    expect(() => Reminder.create({ ...makeBaseProps(), frequencyEvery: 0 })).toThrow(ReminderInvalidFrequencyError);
  });

  it('throws ReminderInvalidFrequencyError when frequencyEvery is negative', () => {
    expect(() => Reminder.create({ ...makeBaseProps(), frequencyEvery: -1 })).toThrow(ReminderInvalidFrequencyError);
  });

  it('throws ReminderInvalidFrequencyError when frequencyEvery is non-integer', () => {
    expect(() => Reminder.create({ ...makeBaseProps(), frequencyEvery: 1.5 })).toThrow(ReminderInvalidFrequencyError);
  });

  it('throws ReminderInvalidDateRangeError when untilOn < startsOn', () => {
    expect(() =>
      Reminder.create({
        ...makeBaseProps(),
        startsOn: new Date('2026-08-01'),
        untilOn: new Date('2026-07-01'),
      }),
    ).toThrow(ReminderInvalidDateRangeError);
  });

  it('does not throw when untilOn equals startsOn', () => {
    const d = new Date('2026-07-01');
    expect(() => Reminder.create({ ...makeBaseProps(), startsOn: d, untilOn: d })).not.toThrow();
  });

  it('throws ReminderDosageRequiredForMedicationError for MEDICATION without dosageAmount', () => {
    expect(() =>
      Reminder.create({ ...makeBaseProps(), type: ReminderTypeEnum.MEDICATION }),
    ).toThrow(ReminderDosageRequiredForMedicationError);
  });

  it('throws ReminderDosageRequiredForMedicationError for MEDICATION with blank dosageAmount', () => {
    expect(() =>
      Reminder.create({ ...makeBaseProps(), type: ReminderTypeEnum.MEDICATION, dosageAmount: '   ' }),
    ).toThrow(ReminderDosageRequiredForMedicationError);
  });

  it('creates MEDICATION reminder with valid dosageAmount', () => {
    const r = Reminder.create({
      ...makeBaseProps(),
      type: ReminderTypeEnum.MEDICATION,
      dosageAmount: '500mg',
    });
    expect(r.dosageAmount).toBe('500mg');
  });
});

describe('Reminder entity — rehydrate', () => {
  it('rehydrates from persistence and validates', () => {
    const r = Reminder.rehydrate({
      id: 'rem-2',
      patientId: 'patient-1',
      createdByUserId: 'user-1',
      type: ReminderTypeEnum.EXAM,
      name: 'Blood test',
      timeOfDay: '09:00',
      frequencyEvery: 3,
      frequencyUnit: ReminderFrequencyUnitEnum.WEEKS,
      startsOn: new Date('2026-07-01'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.id).toBe('rem-2');
    expect(r.frequencyUnit).toBe(ReminderFrequencyUnitEnum.WEEKS);
  });
});

describe('Reminder entity — update', () => {
  it('updates name and sets updatedByUserId', () => {
    const r = Reminder.create(makeBaseProps());
    r.update({ updatedByUserId: 'user-2', name: 'Updated name' });
    expect(r.name).toBe('Updated name');
    expect(r.updatedByUserId).toBe('user-2');
  });

  it('clears dosageAmount when updated to empty string', () => {
    const r = Reminder.create({
      ...makeBaseProps(),
      type: ReminderTypeEnum.MEDICATION,
      dosageAmount: '500mg',
    });
    // Changing type back to GENERAL allows clearing dosage
    r.update({ updatedByUserId: 'user-1', type: ReminderTypeEnum.GENERAL, dosageAmount: '' });
    expect(r.dosageAmount).toBeUndefined();
  });

  it('clears notes when updated to empty string', () => {
    const r = Reminder.create({ ...makeBaseProps(), notes: 'Old note' });
    r.update({ updatedByUserId: 'user-1', notes: '' });
    expect(r.notes).toBeUndefined();
  });

  it('throws domain error on invalid update', () => {
    const r = Reminder.create(makeBaseProps());
    expect(() => r.update({ updatedByUserId: 'user-1', name: '' })).toThrow(ReminderNameRequiredError);
  });
});

describe('Reminder entity — activate / deactivate', () => {
  it('activate sets isActive to true', () => {
    const r = Reminder.create({ ...makeBaseProps(), isActive: false });
    r.activate('user-2');
    expect(r.isActive).toBe(true);
    expect(r.updatedByUserId).toBe('user-2');
  });

  it('deactivate sets isActive to false', () => {
    const r = Reminder.create({ ...makeBaseProps(), isActive: true });
    r.deactivate('user-3');
    expect(r.isActive).toBe(false);
    expect(r.updatedByUserId).toBe('user-3');
  });
});

describe('Reminder entity — all getters', () => {
  it('exposes all property getters after create', () => {
    const startsOn = new Date('2026-07-01');
    const untilOn = new Date('2026-12-31');
    const r = Reminder.create({
      id: 'rem-g',
      patientId: 'patient-g',
      createdByUserId: 'creator-g',
      type: ReminderTypeEnum.EXAM,
      name: 'Blood test',
      timeOfDay: '09:30',
      frequencyEvery: 2,
      frequencyUnit: ReminderFrequencyUnitEnum.WEEKS,
      startsOn,
      untilOn,
      notes: 'Fasting required',
    });

    expect(r.id).toBe('rem-g');
    expect(r.patientId).toBe('patient-g');
    expect(r.createdByUserId).toBe('creator-g');
    expect(r.updatedByUserId).toBeUndefined();
    expect(r.type).toBe(ReminderTypeEnum.EXAM);
    expect(r.name).toBe('Blood test');
    expect(r.timeOfDay).toBe('09:30');
    expect(r.dosageAmount).toBeUndefined();
    expect(r.frequencyEvery).toBe(2);
    expect(r.frequencyUnit).toBe(ReminderFrequencyUnitEnum.WEEKS);
    expect(r.startsOn).toEqual(startsOn);
    expect(r.untilOn).toEqual(untilOn);
    expect(r.notes).toBe('Fasting required');
    expect(r.isActive).toBe(true);
    expect(r.createdAt).toBeDefined();
    expect(r.updatedAt).toBeDefined();
  });
});
