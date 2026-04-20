import { ListAppointmentsQuery } from "../queries/list-appointments.query";

export type AppointmentListScope =
    | { mode: 'all' }
    | { mode: 'patients'; patientIds: string[] };

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
}

