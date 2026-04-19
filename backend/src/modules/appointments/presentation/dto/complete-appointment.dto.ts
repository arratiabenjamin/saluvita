import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class CompleteAppointmentDto {
    @ApiPropertyOptional({ example: '2026-05-20T15:05:00.000Z' })
    @IsOptional()
    @IsDateString()
    endsAt?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    wasAttended?: boolean;

    @ApiPropertyOptional({ example: 'Migraña' })
    @IsOptional()
    @IsString()
    diagnosis?: string;

    @ApiPropertyOptional({ example: 'Tratamiento farmacológico por 7 días' })
    @IsOptional()
    @IsString()
    conclusion?: string;

    @ApiPropertyOptional({ example: 'Control en 2 semanas' })
    @IsOptional()
    @IsString()
    followUpNotes?: string;
}

