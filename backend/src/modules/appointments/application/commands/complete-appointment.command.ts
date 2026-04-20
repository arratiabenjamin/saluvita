export type CompleteAppointmentCommand = {
    id: string;
    endsAt?: Date;
    wasAttended?: boolean;
    diagnosis?: string;
    conclusion?: string;
    followUpNotes?: string;
};

