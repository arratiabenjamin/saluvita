export class AppointmentNotFoundError extends Error {
    constructor(id: string) {
        super(`Appointment with id '${id}' was not found.`);
        this.name = 'AppointmentNotFoundError';
    }
}

export class AppointmentInvalidDateRangeError extends Error {
    constructor() {
        super('Appointment endsAt must be greater than startsAt.');
        this.name = 'AppointmentInvalidDateRangeError';
    }
}

export class AppointmentStatusTransitionError extends Error {
    constructor(from: string, to: string) {
        super(`Invalid appointment status transition from '${from}' to '${to}'.`);
        this.name = 'AppointmentStatusTransitionError';
    }
}

export class AppointmentCancelledReasonRequiredError extends Error {
    constructor() {
        super('Cancelled reason is required.');
        this.name = 'AppointmentCancelledReasonRequiredError';
    }
}

