export class ReminderNameRequiredError extends Error {
  constructor() {
    super('Reminder name is required');
    this.name = 'ReminderNameRequiredError';
  }
}

export class ReminderInvalidTimeOfDayError extends Error {
  constructor() {
    super('Reminder timeOfDay must use HH:mm format');
    this.name = 'ReminderInvalidTimeOfDayError';
  }
}

export class ReminderInvalidFrequencyError extends Error {
  constructor() {
    super('Reminder frequencyEvery must be greater than zero');
    this.name = 'ReminderInvalidFrequencyError';
  }
}

export class ReminderInvalidDateRangeError extends Error {
  constructor() {
    super('Reminder untilOn must be greater than or equal to startsOn');
    this.name = 'ReminderInvalidDateRangeError';
  }
}

export class ReminderDosageRequiredForMedicationError extends Error {
  constructor() {
    super('dosageAmount is required for MEDICATION reminders');
    this.name = 'ReminderDosageRequiredForMedicationError';
  }
}

export class ReminderNotFoundError extends Error {
  constructor(id: string) {
    super(`Reminder with id '${id}' was not found`);
    this.name = 'ReminderNotFoundError';
  }
}

export class ReminderLogSkipReasonRequiredError extends Error {
  constructor() {
    super('skipReason is required when status is SKIPPED');
    this.name = 'ReminderLogSkipReasonRequiredError';
  }
}
