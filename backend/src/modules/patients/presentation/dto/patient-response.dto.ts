import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PatientResponseDto {
    @ApiProperty({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    id!: string;
    @ApiProperty({ example: 'Maria' })
    firstName!: string;
    @ApiProperty({ example: 'Lopez' })
    lastName!: string;
    @ApiPropertyOptional({ example: 'maria@test.com' })
    email?: string;
    @ApiPropertyOptional({ example: 'RUT' })
    documentType?: string;
    @ApiPropertyOptional({ example: '12345678-9' })
    documentNumber?: string;
    @ApiPropertyOptional({ example: '+56911111111' })
    phone?: string;
    @ApiPropertyOptional({ example: '1992-04-10T00:00:00.000Z' })
    birthDate?: string;
    @ApiProperty({ example: '2026-04-15T13:50:42.664Z' })
    createdAt!: string;
}
