import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { PatientDocumentTypeEnum } from "../../../patients/domain/enums/patient-document-type.enum";

export class CreateDependentDto {
    @ApiProperty({ example: 'hijo1@demo.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'Secret123', minLength: 8 })
    @IsString()
    @MinLength(8)
    password!: string;

    @ApiProperty({ example: 'Tomas' })
    @IsString()
    firstName!: string;

    @ApiProperty({ example: 'Arratia' })
    @IsString()
    lastName!: string;

    @ApiProperty({ enum: PatientDocumentTypeEnum, example: PatientDocumentTypeEnum.RUT })
    @IsEnum(PatientDocumentTypeEnum)
    documentType!: PatientDocumentTypeEnum;

    @ApiProperty({ example: '22222222-2' })
    @IsString()
    documentNumber!: string;

    @ApiPropertyOptional({ example: '2015-07-12' })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiPropertyOptional({ example: '+56911111111' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'son' })
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
