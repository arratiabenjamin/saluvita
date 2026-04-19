import type { Appointment as PrismaAppointment, AppointmentStatus as PrismaAppointmentStatus } from "@prisma/client";
import { Appointment } from "../../domain/entities/appointment.entity";
import { AppointmentStatusEnum } from "../../domain/enums/appointment-status.enum";

type AppointmentPersistence = {
    id: string;
    patientId: string;
    recordedByUserId: string;
    startsAt: Date;
    endsAt: Date | null;
    status: PrismaAppointmentStatus;
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
};

export class AppointmentPrismaMapper {
    static toPersistence(appointment: Appointment): AppointmentPersistence {
        return {
            id: appointment.id,
            patientId: appointment.patientId,
            recordedByUserId: appointment.recordedByUserId,
            startsAt: appointment.startsAt,
            endsAt: appointment.endsAt ?? null,
            status: appointment.status as PrismaAppointmentStatus,
            reason: appointment.reason ?? null,
            facilityName: appointment.facilityName ?? null,
            facilityAddress: appointment.facilityAddress ?? null,
            doctorName: appointment.doctorName ?? null,
            specialty: appointment.specialty ?? null,
            wasAttended: appointment.wasAttended ?? null,
            diagnosis: appointment.diagnosis ?? null,
            conclusion: appointment.conclusion ?? null,
            followUpNotes: appointment.followUpNotes ?? null,
            cancelledReason: appointment.cancelledReason ?? null,
            createdAt: appointment.createdAt ?? new Date(),
            updatedAt: appointment.updatedAt ?? new Date(),
        };
    }

    static toDomain(raw: PrismaAppointment): Appointment {
        return Appointment.rehydrate({
            id: raw.id,
            patientId: raw.patientId,
            recordedByUserId: raw.recordedByUserId,
            startsAt: raw.startsAt,
            endsAt: raw.endsAt ?? undefined,
            status: raw.status as AppointmentStatusEnum,
            reason: raw.reason ?? undefined,
            facilityName: raw.facilityName ?? undefined,
            facilityAddress: raw.facilityAddress ?? undefined,
            doctorName: raw.doctorName ?? undefined,
            specialty: raw.specialty ?? undefined,
            wasAttended: raw.wasAttended ?? undefined,
            diagnosis: raw.diagnosis ?? undefined,
            conclusion: raw.conclusion ?? undefined,
            followUpNotes: raw.followUpNotes ?? undefined,
            cancelledReason: raw.cancelledReason ?? undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}

