import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import type {
    DependentSummary,
    GuardianSummary,
    InvitationSummary,
    PatientGuardianQueryService,
} from "../../application/ports/patient-guardian-query.service";

@Injectable()
export class PrismaPatientGuardianQueryService implements PatientGuardianQueryService {
    constructor(private readonly prisma: PrismaService) {}

    async listDependentsByGuardian(guardianUserId: string): Promise<DependentSummary[]> {
        const rows = await this.prisma.patientGuardian.findMany({
            where: { guardianUserId, isActive: true, patient: { deletedAt: null, isActive: true } },
            include: { patient: true },
            orderBy: { createdAt: 'desc' },
        });

        return rows.map((row) => ({
            guardianLinkId: row.id,
            patientId: row.patient.id,
            patientFirstName: row.patient.firstName,
            patientLastName: row.patient.lastName,
            patientDocumentType: row.patient.documentType as unknown as string,
            patientDocumentNumber: row.patient.documentNumber,
            patientEmail: row.patient.email,
            relationship: row.relationship,
            canEditProfile: row.canEditProfile,
            canManageAppointments: row.canManageAppointments,
            acceptedAt: row.acceptedAt,
            createdAt: row.createdAt,
        }));
    }

    async listGuardiansByPatient(patientId: string): Promise<GuardianSummary[]> {
        const rows = await this.prisma.patientGuardian.findMany({
            where: { patientId, isActive: true },
            include: { guardianUser: true },
            orderBy: { createdAt: 'desc' },
        });

        return rows.map((row) => ({
            guardianLinkId: row.id,
            guardianUserId: row.guardianUser.id,
            guardianFirstName: row.guardianUser.firstName,
            guardianLastName: row.guardianUser.lastName,
            guardianEmail: row.guardianUser.email,
            relationship: row.relationship,
            canEditProfile: row.canEditProfile,
            canManageAppointments: row.canManageAppointments,
            acceptedAt: row.acceptedAt,
            createdAt: row.createdAt,
        }));
    }

    async listPendingIncomingForPatient(patientId: string): Promise<InvitationSummary[]> {
        const rows = await this.prisma.patientGuardian.findMany({
            where: {
                patientId,
                isActive: false,
                invitationToken: { not: null },
                rejectedAt: null,
                revokedAt: null,
            },
            include: { patient: true, guardianUser: true },
            orderBy: { invitedAt: 'desc' },
        });
        return rows.map(this.toInvitationSummary);
    }

    async listPendingOutgoingByGuardian(guardianUserId: string): Promise<InvitationSummary[]> {
        const rows = await this.prisma.patientGuardian.findMany({
            where: {
                guardianUserId,
                isActive: false,
                invitationToken: { not: null },
                rejectedAt: null,
                revokedAt: null,
            },
            include: { patient: true, guardianUser: true },
            orderBy: { invitedAt: 'desc' },
        });
        return rows.map(this.toInvitationSummary);
    }

    private toInvitationSummary = (row: any): InvitationSummary => ({
        guardianLinkId: row.id,
        invitationToken: row.invitationToken as string,
        invitationExpiresAt: row.invitationExpiresAt,
        invitedAt: row.invitedAt,
        relationship: row.relationship,
        canEditProfile: row.canEditProfile,
        canManageAppointments: row.canManageAppointments,
        patientId: row.patient.id,
        patientFirstName: row.patient.firstName,
        patientLastName: row.patient.lastName,
        guardianUserId: row.guardianUser.id,
        guardianFirstName: row.guardianUser.firstName,
        guardianLastName: row.guardianUser.lastName,
        guardianEmail: row.guardianUser.email,
        createdAt: row.createdAt,
    });
}
