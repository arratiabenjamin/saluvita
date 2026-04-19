import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class UpdateAppointmentDto {
    @ApiPropertyOptional({ example: '2026-05-21T11:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    startsAt?: string;

    @ApiPropertyOptional({ example: '2026-05-21T11:30:00.000Z' })
    @IsOptional()
    @IsDateString()
    endsAt?: string;

    @ApiPropertyOptional({ example: 'Reagendada por disponibilidad' })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiPropertyOptional({ example: 'Clínica Las Condes' })
    @IsOptional()
    @IsString()
    facilityName?: string;

    @ApiPropertyOptional({ example: 'Lo Fontecilla 441, Las Condes' })
    @IsOptional()
    @IsString()
    facilityAddress?: string;

    @ApiPropertyOptional({ example: 'Dr. Juan Pérez' })
    @IsOptional()
    @IsString()
    doctorName?: string;

    @ApiPropertyOptional({ example: 'Neurología' })
    @IsOptional()
    @IsString()
    specialty?: string;
}

