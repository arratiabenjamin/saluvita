type CreateAppointmentProps = {
    id: string,
    patientId: string,
    recordedByUserId: string,
    reason?: string,
    facilityName?: string,
    facilityAddress?: string,
    doctorName?: string,
    specialty?: string,
    startAt: Date,
}

type RehydrateAppointmentProps = CreateAppointmentProps & {
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date | null,
}

export class Appointment {
    private reasonValue?: string;
    private facilityNameValue?: string;
    private facilityAddressValue?: string;
    private doctorNameValue?: string;
    private specialtyValue?: string;
    private startAtValue?: Date;

    constructor(
        public readonly id: string,
        public readonly patientId: string,
        public readonly recordedByUserId: string,
        reason?: string,
        facilityName?: string,
        facilityAddress?: string,
        doctorName?: string,
        specialty?: string,
        startAt?: Date,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date,
        public readonly deletedAt?: Date | null,
    ) {
        this.reasonValue = reason;
        this.facilityNameValue = facilityName;
        this.facilityAddressValue = facilityAddress;
        this.doctorNameValue = doctorName;
        this.specialtyValue = specialty;
        this.startAtValue = startAt;
    }

    // Crear una Cita nueva - Valida las invariantes obligatorias.
    static create(props: CreateAppointmentProps): Appointment {
        if (!props.id) throw new Error('Appointment id is required');
        if (!props.patientId) throw new Error('Patient id is required');
        if (!props.recordedByUserId) throw new Error('Recorded by user id is required');
        if (!props.startAt) throw new Error('Start date and time is required');

        return new Appointment(
            props.id,
            props.patientId,
            props.recordedByUserId,
            props.reason,
            props.facilityName,
            props.facilityAddress,
            props.doctorName,
            props.specialty,
            props.startAt,
        );
    }

    // Reconstruir desde persistencia - No pasa por validaciones de creación.
    static rehydrate(props: RehydrateAppointmentProps): Appointment {
        return new Appointment(
            props.id,
            props.patientId,
            props.recordedByUserId,
            props.reason,
            props.facilityName,
            props.facilityAddress,
            props.doctorName,
            props.specialty,
            props.startAt,
            props.createdAt,
            props.updatedAt,
            props.deletedAt,
        );
    }

    // Actualizar info - Método de negocio, no setter suelto.
    updateInfo(props: {
        reason?: string,
        facilityName?: string,
        facilityAddress?: string,
        doctorName?: string,
        specialty?: string,
        startAt?: Date,
    }): void {
        if (props.reason !== undefined) this.reasonValue = props.reason;
        if (props.facilityName !== undefined) this.facilityNameValue = props.facilityName;
        if (props.facilityAddress !== undefined) this.facilityAddressValue = props.facilityAddress;
        if (props.doctorName !== undefined) this.doctorNameValue = props.doctorName;
        if (props.specialty !== undefined) this.specialtyValue = props.specialty;
        if (props.startAt !== undefined) this.startAtValue = props.startAt;
    }

    get reason(): string | undefined { return this.reasonValue; }
    get facilityName(): string | undefined { return this.facilityNameValue; }
    get facilityAddress(): string | undefined { return this.facilityAddressValue; }
    get doctorName(): string | undefined { return this.doctorNameValue; }
    get specialty(): string | undefined { return this.specialtyValue; }
    get startAt(): Date | undefined { return this.startAtValue; }
}