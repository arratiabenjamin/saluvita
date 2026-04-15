export class PatientResponseDto {
    id!: string;
    firstName!: string;
    lastName!: string;
    email?: string;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
    birthDate?: string;
    createdAt!: string;
}
