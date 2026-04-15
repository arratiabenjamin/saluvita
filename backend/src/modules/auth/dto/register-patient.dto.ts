import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PatientDocumentTypeEnum } from '../../patients/domain/enums/patient-document-type.enum';

export class RegisterPatientDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEnum(PatientDocumentTypeEnum)
  documentType!: PatientDocumentTypeEnum;

  @IsString()
  documentNumber!: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
