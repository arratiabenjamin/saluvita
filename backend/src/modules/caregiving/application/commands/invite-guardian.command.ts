export interface InviteGuardianCommand {
    targetPatientEmail: string;
    relationship?: string;
    canEditProfile?: boolean;
    canManageAppointments?: boolean;
}
