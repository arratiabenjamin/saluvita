import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DependentResponseDto {
    @ApiProperty()
    guardianLinkId!: string;

    @ApiProperty()
    patientId!: string;

    @ApiProperty({ example: 'Tomas' })
    patientFirstName!: string;

    @ApiProperty({ example: 'Arratia' })
    patientLastName!: string;

    @ApiProperty({ example: 'RUT' })
    patientDocumentType!: string;

    @ApiProperty({ example: '22222222-2' })
    patientDocumentNumber!: string;

    @ApiPropertyOptional({ example: 'hijo1@demo.com' })
    patientEmail?: string | null;

    @ApiPropertyOptional({ example: 'son' })
    relationship?: string | null;

    @ApiProperty({ example: true })
    canEditProfile!: boolean;

    @ApiProperty({ example: true })
    canManageAppointments!: boolean;

    @ApiPropertyOptional({ example: '2026-04-24T14:00:00.000Z' })
    acceptedAt?: string | null;

    @ApiProperty({ example: '2026-04-24T14:00:00.000Z' })
    createdAt!: string;
}
