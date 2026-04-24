export interface UpdateGuardianPermissionsCommand {
    guardianLinkId: string;
    canEditProfile?: boolean;
    canManageAppointments?: boolean;
}
