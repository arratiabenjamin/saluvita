import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PatientDocumentTypeEnum } from '../../patients/domain/enums/patient-document-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterPatientDto {
  @ApiProperty({ example: 'paciente1@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Maria' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Lopez' })
  @IsString()
  lastName!: string;

  @ApiProperty({ enum: PatientDocumentTypeEnum, example: PatientDocumentTypeEnum.RUT })
  @IsEnum(PatientDocumentTypeEnum)
  documentType!: PatientDocumentTypeEnum;

  @ApiProperty({ example: '12345678-9' })
  @IsString()
  documentNumber!: string;

  @ApiPropertyOptional({ example: '1992-04-10' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '+56911111111' })
  @IsOptional()
  @IsString()
  phone?: string;
}
