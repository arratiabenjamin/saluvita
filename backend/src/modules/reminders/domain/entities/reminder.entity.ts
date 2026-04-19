import { ReminderFrequencyUnitEnum } from '../enums/reminder-frequency-unit.enum';
import { ReminderTypeEnum } from '../enums/reminder-type.enum';
import {
  ReminderDosageRequiredForMedicationError,
  ReminderInvalidDateRangeError,
  ReminderInvalidFrequencyError,
  ReminderInvalidTimeOfDayError,
  ReminderNameRequiredError,
} from '../errors/reminder-domain.errors';

export type ReminderProps = {
  id: string;
  patientId: string;
  createdByUserId: string;
  updatedByUserId?: string;
  type: ReminderTypeEnum;
  name: string;
  timeOfDay: string;
  dosageAmount?: string;
  frequencyEvery: number;
  frequencyUnit: ReminderFrequencyUnitEnum;
  startsOn: Date;
  untilOn?: Date;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Reminder {
  private constructor(private props: ReminderProps) {}

  static create(props: Omit<ReminderProps, 'isActive' | 'createdAt' | 'updatedAt'> & { isActive?: boolean }): Reminder {
    const now = new Date();
    const entity = new Reminder({
      ...props,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    entity.validate();
    return entity;
  }

  static rehydrate(props: ReminderProps): Reminder {
    const entity = new Reminder(props);
    entity.validate();
    return entity;
  }

  get id() { return this.props.id; }
  get patientId() { return this.props.patientId; }
  get createdByUserId() { return this.props.createdByUserId; }
  get updatedByUserId() { return this.props.updatedByUserId; }
  get type() { return this.props.type; }
  get name() { return this.props.name; }
  get timeOfDay() { return this.props.timeOfDay; }
  get dosageAmount() { return this.props.dosageAmount; }
  get frequencyEvery() { return this.props.frequencyEvery; }
  get frequencyUnit() { return this.props.frequencyUnit; }
  get startsOn() { return this.props.startsOn; }
  get untilOn() { return this.props.untilOn; }
  get notes() { return this.props.notes; }
  get isActive() { return this.props.isActive; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  update(data: {
    updatedByUserId: string;
    type?: ReminderTypeEnum;
    name?: string;
    timeOfDay?: string;
    dosageAmount?: string;
    frequencyEvery?: number;
    frequencyUnit?: ReminderFrequencyUnitEnum;
    startsOn?: Date;
    untilOn?: Date;
    notes?: string;
    isActive?: boolean;
  }) {
    if (data.type !== undefined) this.props.type = data.type;
    if (data.name !== undefined) this.props.name = data.name;
    if (data.timeOfDay !== undefined) this.props.timeOfDay = data.timeOfDay;
    if (data.dosageAmount !== undefined) this.props.dosageAmount = normalizeOptional(data.dosageAmount);
    if (data.frequencyEvery !== undefined) this.props.frequencyEvery = data.frequencyEvery;
    if (data.frequencyUnit !== undefined) this.props.frequencyUnit = data.frequencyUnit;
    if (data.startsOn !== undefined) this.props.startsOn = data.startsOn;
    if (data.untilOn !== undefined) this.props.untilOn = data.untilOn;
    if (data.notes !== undefined) this.props.notes = normalizeOptional(data.notes);
    if (data.isActive !== undefined) this.props.isActive = data.isActive;

    this.props.updatedByUserId = data.updatedByUserId;
    this.props.updatedAt = new Date();

    this.validate();
  }

  activate(updatedByUserId: string) {
    this.props.isActive = true;
    this.props.updatedByUserId = updatedByUserId;
    this.props.updatedAt = new Date();
  }

  deactivate(updatedByUserId: string) {
    this.props.isActive = false;
    this.props.updatedByUserId = updatedByUserId;
    this.props.updatedAt = new Date();
  }

  private validate() {
    if (!this.props.name?.trim()) throw new ReminderNameRequiredError();

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(this.props.timeOfDay)) {
      throw new ReminderInvalidTimeOfDayError();
    }

    if (!Number.isInteger(this.props.frequencyEvery) || this.props.frequencyEvery <= 0) {
      throw new ReminderInvalidFrequencyError();
    }

    if (this.props.untilOn && this.props.untilOn < this.props.startsOn) {
      throw new ReminderInvalidDateRangeError();
    }

    if (this.props.type === ReminderTypeEnum.MEDICATION && !this.props.dosageAmount?.trim()) {
      throw new ReminderDosageRequiredForMedicationError();
    }
  }
}

function normalizeOptional(value?: string): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}
