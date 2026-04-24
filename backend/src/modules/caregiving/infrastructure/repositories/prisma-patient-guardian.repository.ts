import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import type {
    CreateDependentInput,
    CreateDependentResult,
    PatientGuardianRepository,
} from "../../application/ports/patient-guardian.repository";
import { PatientGuardian } from "../../domain/entities/patient-guardian.entity";
import { PatientGuardianPrismaMapper } from "../mappers/patient-guardian-prisma.mapper";
import {
    DependentDocumentAlreadyExistsError,
    EmailAlreadyInUseError,
} from "../../domain/errors/caregiving-domain.errors";
import { ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@Injectable()
export class PrismaPatientGuardianRepository implements PatientGuardianRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<PatientGuardian | null> {
        const row = await this.prisma.patientGuardian.findUnique({ where: { id } });
        return row ? PatientGuardianPrismaMapper.toDomain(row) : null;
    }

    async findByInvitationToken(token: string): Promise<PatientGuardian | null> {
        const row = await this.prisma.patientGuardian.findUnique({ where: { invitationToken: token } });
        return row ? PatientGuardianPrismaMapper.toDomain(row) : null;
    }

    async findActiveByPatientAndGuardian(patientId: string, guardianUserId: string): Promise<PatientGuardian | null> {
        const row = await this.prisma.patientGuardian.findFirst({
            where: { patientId, guardianUserId, isActive: true },
        });
        return row ? PatientGuardianPrismaMapper.toDomain(row) : null;
    }

    async findAnyByPatientAndGuardian(patientId: string, guardianUserId: string): Promise<PatientGuardian | null> {
        const row = await this.prisma.patientGuardian.findFirst({
            where: { patientId, guardianUserId },
            orderBy: { updatedAt: 'desc' },
        });
        return row ? PatientGuardianPrismaMapper.toDomain(row) : null;
    }

    async createDependent(input: CreateDependentInput): Promise<CreateDependentResult> {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: input.email, deletedAt: null },
        });
        if (existingUser) throw new EmailAlreadyInUseError();

        const existingPatient = await this.prisma.patient.findFirst({
            where: {
                documentType: input.documentType as any,
                documentNumber: input.documentNumber,
                deletedAt: null,
            },
        });
        if (existingPatient) throw new DependentDocumentAlreadyExistsError();

        return this.prisma.$transaction(async (tx) => {
            const patientRole = await tx.role.upsert({
                where: { code: ROLE_PATIENT as any },
                create: { code: ROLE_PATIENT as any, name: 'Patient' },
                update: {},
            });

            const caregiverRole = await tx.role.upsert({
                where: { code: ROLE_CAREGIVER as any },
                create: { code: ROLE_CAREGIVER as any, name: 'Caregiver' },
                update: {},
            });

            const dependentUser = await tx.user.create({
                data: {
                    email: input.email,
                    passwordHash: input.passwordHash,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    status: 'ACTIVE',
                },
            });

            await tx.userRole.create({
                data: { userId: dependentUser.id, roleId: patientRole.id },
            });

            const dependentPatient = await tx.patient.create({
                data: {
                    userId: dependentUser.id,
                    documentType: input.documentType as any,
                    documentNumber: input.documentNumber,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    birthDate: input.birthDate ?? null,
                    email: input.email,
                    phone: input.phone,
                    createdByUserId: input.creatorUserId,
                },
            });

            const creatorHasCaregiverRole = await tx.userRole.findUnique({
                where: { userId_roleId: { userId: input.creatorUserId, roleId: caregiverRole.id } },
            });
            if (!creatorHasCaregiverRole) {
                await tx.userRole.create({
                    data: { userId: input.creatorUserId, roleId: caregiverRole.id },
                });
            }

            const now = new Date();
            const guardianLink = await tx.patientGuardian.create({
                data: {
                    patientId: dependentPatient.id,
                    guardianUserId: input.creatorUserId,
                    relationship: input.relationship,
                    canEditProfile: input.canEditProfile,
                    canManageAppointments: input.canManageAppointments,
                    isActive: true,
                    createdByUserId: input.creatorUserId,
                    acceptedAt: now,
                },
            });

            return {
                userId: dependentUser.id,
                patientId: dependentPatient.id,
                guardianLinkId: guardianLink.id,
            };
        });
    }

    async createInvitation(params: {
        patientId: string;
        guardianUserId: string;
        createdByUserId: string;
        relationship?: string;
        canEditProfile: boolean;
        canManageAppointments: boolean;
        invitationToken: string;
        invitationExpiresAt: Date;
    }): Promise<PatientGuardian> {
        const row = await this.prisma.patientGuardian.create({
            data: {
                patientId: params.patientId,
                guardianUserId: params.guardianUserId,
                relationship: params.relationship,
                canEditProfile: params.canEditProfile,
                canManageAppointments: params.canManageAppointments,
                isActive: false,
                createdByUserId: params.createdByUserId,
                invitationToken: params.invitationToken,
                invitationExpiresAt: params.invitationExpiresAt,
                invitedAt: new Date(),
            },
        });
        return PatientGuardianPrismaMapper.toDomain(row);
    }

    async refreshInvitation(params: {
        id: string;
        createdByUserId: string;
        relationship?: string;
        canEditProfile: boolean;
        canManageAppointments: boolean;
        invitationToken: string;
        invitationExpiresAt: Date;
    }): Promise<PatientGuardian> {
        const row = await this.prisma.patientGuardian.update({
            where: { id: params.id },
            data: {
                relationship: params.relationship,
                canEditProfile: params.canEditProfile,
                canManageAppointments: params.canManageAppointments,
                isActive: false,
                createdByUserId: params.createdByUserId,
                invitationToken: params.invitationToken,
                invitationExpiresAt: params.invitationExpiresAt,
                invitedAt: new Date(),
                acceptedAt: null,
                rejectedAt: null,
                revokedAt: null,
            },
        });
        return PatientGuardianPrismaMapper.toDomain(row);
    }

    async acceptInvitation(id: string): Promise<PatientGuardian> {
        const row = await this.prisma.patientGuardian.update({
            where: { id },
            data: {
                isActive: true,
                acceptedAt: new Date(),
                invitationToken: null,
            },
        });
        return PatientGuardianPrismaMapper.toDomain(row);
    }

    async rejectInvitation(id: string): Promise<PatientGuardian> {
        const row = await this.prisma.patientGuardian.update({
            where: { id },
            data: {
                rejectedAt: new Date(),
                invitationToken: null,
            },
        });
        return PatientGuardianPrismaMapper.toDomain(row);
    }

    async updatePermissions(id: string, params: {
        canEditProfile?: boolean;
        canManageAppointments?: boolean;
    }): Promise<PatientGuardian> {
        const row = await this.prisma.patientGuardian.update({
            where: { id },
            data: {
                canEditProfile: params.canEditProfile,
                canManageAppointments: params.canManageAppointments,
            },
        });
        return PatientGuardianPrismaMapper.toDomain(row);
    }

    async revoke(id: string): Promise<PatientGuardian> {
        const row = await this.prisma.patientGuardian.update({
            where: { id },
            data: {
                isActive: false,
                revokedAt: new Date(),
                invitationToken: null,
            },
        });
        return PatientGuardianPrismaMapper.toDomain(row);
    }
}
