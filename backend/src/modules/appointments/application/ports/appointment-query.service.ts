import { ListAppointmentsQuery } from "../queries/list-appointments.query";
import { ListAppointmentProfessionalsQuery } from "../queries/list-appointment-professionals.query";

export type AppointmentListScope =
    | { mode: 'all' }
    | { mode: 'patients'; patientIds: string[] };

export type AppointmentProfessionalSummary = {
    id: string;
    doctorName: string;
    specialty: string | null;
    facilityName: string | null;
    facilityAddress: string | null;
    totalAppointments: number;
    lastAppointmentAt: Date | null;
    lastCompletedAt: Date | null;
    nextAppointmentAt: Date | null;
};

export interface AppointmentQueryService {
    listPaginated(query: ListAppointmentsQuery, scope: AppointmentListScope): Promise<{
        data: Array<{
            id: string;
            patientId: string;
            startsAt: Date;
            endsAt: Date | null;
            status: string;
            reason: string | null;
            facilityName: string | null;
            facilityAddress: string | null;
            doctorName: string | null;
            specialty: string | null;
            wasAttended: boolean | null;
            diagnosis: string | null;
            conclusion: string | null;
            followUpNotes: string | null;
            cancelledReason: string | null;
            createdAt: Date;
            updatedAt: Date;
        }>;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;

    listProfessionals(
        query: ListAppointmentProfessionalsQuery,
        scope: AppointmentListScope,
    ): Promise<AppointmentProfessionalSummary[]>;
}
