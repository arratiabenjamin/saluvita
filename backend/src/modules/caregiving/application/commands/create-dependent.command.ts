export interface CreateDependentCommand {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate?: Date;
    phone?: string;
    relationship?: string;
    canEditProfile?: boolean;
    canManageAppointments?: boolean;
}
