import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

export class InviteGuardianDto {
    @ApiProperty({ example: 'mama@demo.com', description: 'Email del paciente al que se quiere cuidar' })
    @IsEmail()
    targetPatientEmail!: string;

    @ApiPropertyOptional({ example: 'daughter' })
    @IsOptional()
    @IsString()
    relationship?: string;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    canEditProfile?: boolean;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    canManageAppointments?: boolean;
}
