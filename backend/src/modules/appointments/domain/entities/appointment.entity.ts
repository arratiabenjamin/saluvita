import { AppointmentStatusEnum } from "../enums/appointment-status.enum";
import {
    AppointmentCancelledReasonRequiredError,
    AppointmentInvalidDateRangeError,
    AppointmentStatusTransitionError,
} from "../errors/appointment-domain.errors";

export type AppointmentProps = {
    id: string;
    patientId: string;
    recordedByUserId: string;
    startsAt: Date;
    endsAt?: Date;
    status: AppointmentStatusEnum;
    reason?: string;
    facilityName?: string;
    facilityAddress?: string;
    doctorName?: string;
    specialty?: string;
    wasAttended?: boolean;
    diagnosis?: string;
    conclusion?: string;
    followUpNotes?: string;
    cancelledReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

type AppointmentUpdateInput = {
    startsAt?: Date;
    endsAt?: Date;
    reason?: string;
    facilityName?: string;
    facilityAddress?: string;
    doctorName?: string;
    specialty?: string;
};

type AppointmentCompleteInput = {
    endsAt?: Date;
    wasAttended?: boolean;
    diagnosis?: string;
    conclusion?: string;
    followUpNotes?: string;
};

export class Appointment {
    // Se mantiene state privado y se exponen getters para proteger invariantes.
    private constructor(private props: AppointmentProps) {}

    static create(props: Omit<AppointmentProps, 'status' | 'createdAt' | 'updatedAt'>): Appointment {
        const now = new Date();
        const entity = new Appointment({
            ...props,
            status: AppointmentStatusEnum.PLANNED,
            createdAt: now,
            updatedAt: now,
        });
        entity.ensureDateRange(entity.props.startsAt, entity.props.endsAt);
        return entity;
    }

    static rehydrate(props: AppointmentProps): Appointment {
        return new Appointment(props);
    }

    get id() { return this.props.id; }
    get patientId() { return this.props.patientId; }
    get recordedByUserId() { return this.props.recordedByUserId; }
    get startsAt() { return this.props.startsAt; }
    get endsAt() { return this.props.endsAt; }
    get status() { return this.props.status; }
    get reason() { return this.props.reason; }
    get facilityName() { return this.props.facilityName; }
    get facilityAddress() { return this.props.facilityAddress; }
    get doctorName() { return this.props.doctorName; }
    get specialty() { return this.props.specialty; }
    get wasAttended() { return this.props.wasAttended; }
    get diagnosis() { return this.props.diagnosis; }
    get conclusion() { return this.props.conclusion; }
    get followUpNotes() { return this.props.followUpNotes; }
    get cancelledReason() { return this.props.cancelledReason; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }

    updateDetails(input: AppointmentUpdateInput) {
        this.ensureCanEditCurrentState();

        const nextStartsAt = input.startsAt ?? this.props.startsAt;
        const nextEndsAt = input.endsAt ?? this.props.endsAt;
        this.ensureDateRange(nextStartsAt, nextEndsAt);

        this.props.startsAt = nextStartsAt;
        this.props.endsAt = nextEndsAt;
        this.props.reason = normalizeOptionalString(input.reason, this.props.reason);
        this.props.facilityName = normalizeOptionalString(input.facilityName, this.props.facilityName);
        this.props.facilityAddress = normalizeOptionalString(input.facilityAddress, this.props.facilityAddress);
        this.props.doctorName = normalizeOptionalString(input.doctorName, this.props.doctorName);
        this.props.specialty = normalizeOptionalString(input.specialty, this.props.specialty);
        this.touch();
    }

    complete(input: AppointmentCompleteInput) {
        if (this.props.status !== AppointmentStatusEnum.PLANNED) {
            throw new AppointmentStatusTransitionError(this.props.status, AppointmentStatusEnum.COMPLETED);
        }

        const nextEndsAt = input.endsAt ?? this.props.endsAt;
        this.ensureDateRange(this.props.startsAt, nextEndsAt);

        this.props.endsAt = nextEndsAt;
        this.props.wasAttended = input.wasAttended;
        this.props.diagnosis = normalizeOptionalString(input.diagnosis, this.props.diagnosis);
        this.props.conclusion = normalizeOptionalString(input.conclusion, this.props.conclusion);
        this.props.followUpNotes = normalizeOptionalString(input.followUpNotes, this.props.followUpNotes);
        this.props.status = AppointmentStatusEnum.COMPLETED;
        this.touch();
    }

    cancel(reason: string) {
        if (this.props.status !== AppointmentStatusEnum.PLANNED) {
            throw new AppointmentStatusTransitionError(this.props.status, AppointmentStatusEnum.CANCELLED);
        }

        const normalizedReason = reason?.trim();
        if (!normalizedReason) throw new AppointmentCancelledReasonRequiredError();

        this.props.cancelledReason = normalizedReason;
        this.props.status = AppointmentStatusEnum.CANCELLED;
        this.touch();
    }

    private ensureCanEditCurrentState() {
        if (this.props.status !== AppointmentStatusEnum.PLANNED) {
            throw new AppointmentStatusTransitionError(this.props.status, 'EDIT');
        }
    }

    private ensureDateRange(startsAt: Date, endsAt?: Date) {
        if (endsAt && endsAt <= startsAt) {
            throw new AppointmentInvalidDateRangeError();
        }
    }

    private touch() {
        this.props.updatedAt = new Date();
    }
}

function normalizeOptionalString(incoming?: string, previous?: string): string | undefined {
    if (incoming === undefined) return previous;
    const trimmed = incoming.trim();
    return trimmed.length ? trimmed : undefined;
}

