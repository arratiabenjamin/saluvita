export type UpdateAppointmentCommand = {
    id: string;
    startsAt?: Date;
    endsAt?: Date;
    reason?: string;
    facilityName?: string;
    facilityAddress?: string;
    doctorName?: string;
    specialty?: string;
};

