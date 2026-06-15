import {
  AppointmentNotFoundError,
  AppointmentInvalidDateRangeError,
  AppointmentStatusTransitionError,
  AppointmentCancelledReasonRequiredError,
} from './appointment-domain.errors';

describe('appointment domain errors', () => {
  it('AppointmentNotFoundError carries id in message', () => {
    const err = new AppointmentNotFoundError('appt-123');
    expect(err.message).toContain('appt-123');
    expect(err.name).toBe('AppointmentNotFoundError');
    expect(err).toBeInstanceOf(Error);
  });

  it('AppointmentInvalidDateRangeError has correct message', () => {
    const err = new AppointmentInvalidDateRangeError();
    expect(err.message).toBeTruthy();
    expect(err.name).toBe('AppointmentInvalidDateRangeError');
  });

  it('AppointmentStatusTransitionError carries from/to in message', () => {
    const err = new AppointmentStatusTransitionError('PLANNED', 'CANCELLED');
    expect(err.message).toContain('PLANNED');
    expect(err.message).toContain('CANCELLED');
    expect(err.name).toBe('AppointmentStatusTransitionError');
  });

  it('AppointmentCancelledReasonRequiredError has correct message', () => {
    const err = new AppointmentCancelledReasonRequiredError();
    expect(err.message).toBeTruthy();
    expect(err.name).toBe('AppointmentCancelledReasonRequiredError');
  });
});
