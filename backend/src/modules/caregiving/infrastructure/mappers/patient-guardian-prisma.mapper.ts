import type { PatientGuardian as PrismaPatientGuardian } from "@prisma/client";
import { PatientGuardian } from "../../domain/entities/patient-guardian.entity";

export class PatientGuardianPrismaMapper {
    static toDomain(raw: PrismaPatientGuardian): PatientGuardian {
        return PatientGuardian.rehydrate({
            id: raw.id,
            patientId: raw.patientId,
            guardianUserId: raw.guardianUserId,
            relationship: raw.relationship ?? undefined,
            canEditProfile: raw.canEditProfile,
            canManageAppointments: raw.canManageAppointments,
            isActive: raw.isActive,
            createdByUserId: raw.createdByUserId,
            invitationToken: raw.invitationToken ?? undefined,
            invitationExpiresAt: raw.invitationExpiresAt ?? undefined,
            invitedAt: raw.invitedAt ?? undefined,
            acceptedAt: raw.acceptedAt ?? undefined,
            rejectedAt: raw.rejectedAt ?? undefined,
            revokedAt: raw.revokedAt ?? undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
