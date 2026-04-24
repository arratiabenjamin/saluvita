import { PatientGuardian } from "../../domain/entities/patient-guardian.entity";

export interface CreateDependentInput {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate?: Date;
    phone?: string;
    creatorUserId: string;
    relationship?: string;
    canEditProfile: boolean;
    canManageAppointments: boolean;
}

export interface CreateDependentResult {
    userId: string;
    patientId: string;
    guardianLinkId: string;
}

export interface PatientGuardianRepository {
    findById(id: string): Promise<PatientGuardian | null>;
    findByInvitationToken(token: string): Promise<PatientGuardian | null>;
    findActiveByPatientAndGuardian(patientId: string, guardianUserId: string): Promise<PatientGuardian | null>;
    findAnyByPatientAndGuardian(patientId: string, guardianUserId: string): Promise<PatientGuardian | null>;

    createDependent(input: CreateDependentInput): Promise<CreateDependentResult>;

    createInvitation(params: {
        patientId: string;
        guardianUserId: string;
        createdByUserId: string;
        relationship?: string;
        canEditProfile: boolean;
        canManageAppointments: boolean;
        invitationToken: string;
        invitationExpiresAt: Date;
    }): Promise<PatientGuardian>;

    refreshInvitation(params: {
        id: string;
        createdByUserId: string;
        relationship?: string;
        canEditProfile: boolean;
        canManageAppointments: boolean;
        invitationToken: string;
        invitationExpiresAt: Date;
    }): Promise<PatientGuardian>;

    acceptInvitation(id: string): Promise<PatientGuardian>;
    rejectInvitation(id: string): Promise<PatientGuardian>;

    updatePermissions(id: string, params: {
        canEditProfile?: boolean;
        canManageAppointments?: boolean;
    }): Promise<PatientGuardian>;

    revoke(id: string): Promise<PatientGuardian>;
}
