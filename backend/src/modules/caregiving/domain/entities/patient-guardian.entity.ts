export type PatientGuardianProps = {
    id: string;
    patientId: string;
    guardianUserId: string;
    relationship?: string;
    canEditProfile: boolean;
    canManageAppointments: boolean;
    isActive: boolean;
    createdByUserId: string;
    invitationToken?: string;
    invitationExpiresAt?: Date;
    invitedAt?: Date;
    acceptedAt?: Date;
    rejectedAt?: Date;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type GuardianLinkStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REVOKED';

export class PatientGuardian {
    private constructor(private props: PatientGuardianProps) {}

    static rehydrate(props: PatientGuardianProps): PatientGuardian {
        return new PatientGuardian(props);
    }

    get id() { return this.props.id; }
    get patientId() { return this.props.patientId; }
    get guardianUserId() { return this.props.guardianUserId; }
    get relationship() { return this.props.relationship; }
    get canEditProfile() { return this.props.canEditProfile; }
    get canManageAppointments() { return this.props.canManageAppointments; }
    get isActive() { return this.props.isActive; }
    get createdByUserId() { return this.props.createdByUserId; }
    get invitationToken() { return this.props.invitationToken; }
    get invitationExpiresAt() { return this.props.invitationExpiresAt; }
    get invitedAt() { return this.props.invitedAt; }
    get acceptedAt() { return this.props.acceptedAt; }
    get rejectedAt() { return this.props.rejectedAt; }
    get revokedAt() { return this.props.revokedAt; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }

    get status(): GuardianLinkStatus {
        if (this.props.isActive) return 'ACTIVE';
        if (this.props.rejectedAt) return 'REJECTED';
        if (this.props.revokedAt) return 'REVOKED';
        return 'PENDING';
    }

    isPending(): boolean {
        return !this.props.isActive
            && !!this.props.invitationToken
            && !this.props.rejectedAt
            && !this.props.revokedAt;
    }

    isExpired(now: Date = new Date()): boolean {
        return !!this.props.invitationExpiresAt && this.props.invitationExpiresAt < now;
    }
}
