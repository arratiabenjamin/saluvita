import { AppointmentStatusEnum } from "../../domain/enums/appointment-status.enum";

export type ListAppointmentsQuery = {
    page: number;
    limit: number;
    patientId?: string;
    status?: AppointmentStatusEnum;
    from?: Date;
    to?: Date;
    search?: string;
};

