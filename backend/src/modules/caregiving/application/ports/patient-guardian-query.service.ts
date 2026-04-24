export interface DependentSummary {
    guardianLinkId: string;
    patientId: string;
    patientFirstName: string;
    patientLastName: string;
    patientDocumentType: string;
    patientDocumentNumber: string;
    patientEmail: string | null;
    relationship: string | null;
    canEditProfile: boolean;
    canManageAppointments: boolean;
    acceptedAt: Date | null;
    createdAt: Date;
}

export interface GuardianSummary {
    guardianLinkId: string;
    guardianUserId: string;
    guardianFirstName: string;
    guardianLastName: string;
    guardianEmail: string;
    relationship: string | null;
    canEditProfile: boolean;
    canManageAppointments: boolean;
    acceptedAt: Date | null;
    createdAt: Date;
}

export interface InvitationSummary {
    guardianLinkId: string;
    invitationToken: string;
    invitationExpiresAt: Date | null;
    invitedAt: Date | null;
    relationship: string | null;
    canEditProfile: boolean;
    canManageAppointments: boolean;
    patientId: string;
    patientFirstName: string;
    patientLastName: string;
    guardianUserId: string;
    guardianFirstName: string;
    guardianLastName: string;
    guardianEmail: string;
    createdAt: Date;
}

export interface PatientGuardianQueryService {
    listDependentsByGuardian(guardianUserId: string): Promise<DependentSummary[]>;
    listGuardiansByPatient(patientId: string): Promise<GuardianSummary[]>;
    listPendingIncomingForPatient(patientId: string): Promise<InvitationSummary[]>;
    listPendingOutgoingByGuardian(guardianUserId: string): Promise<InvitationSummary[]>;
}
