import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAppointmentDto {
    @ApiProperty({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    @IsUUID()
    patientId!: string;

    @ApiProperty({ example: '2026-05-20T14:30:00.000Z' })
    @IsDateString()
    startsAt!: string;

    @ApiPropertyOptional({ example: '2026-05-20T15:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    endsAt?: string;

    @ApiPropertyOptional({ example: 'Control general' })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiPropertyOptional({ example: 'Clínica Santa María' })
    @IsOptional()
    @IsString()
    facilityName?: string;

    @ApiPropertyOptional({ example: 'Av. Santa María 0500, Santiago' })
    @IsOptional()
    @IsString()
    facilityAddress?: string;

    @ApiPropertyOptional({ example: 'Dra. Paula Rojas' })
    @IsOptional()
    @IsString()
    doctorName?: string;

    @ApiPropertyOptional({ example: 'Medicina General' })
    @IsOptional()
    @IsString()
    specialty?: string;
}

