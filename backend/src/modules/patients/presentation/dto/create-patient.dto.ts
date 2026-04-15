import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { PatientDocumentTypeEnum } from "../../domain/enums/patient-document-type.enum";

export class CreatePatientDto {
    @IsString() firstName!: string;
    @IsString() lastName!: string;

    @IsOptional() @IsEmail() email?: string;

    @IsEnum(PatientDocumentTypeEnum) documentType!: PatientDocumentTypeEnum;
    @IsString() documentNumber!: string;

    @IsOptional() @IsString() phone?: string;

    @IsOptional() @IsString() birthDate?: string;
}
