import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { PatientDocumentTypeEnum } from "../../domain/enums/patient-document-type.enum";

export class UpdatePatientDto {
    @IsOptional() @IsString() firstName!: string;
    @IsOptional() @IsString() lastName!: string;

    @IsOptional() @IsEmail() email?: string;

    @IsOptional() @IsEnum(PatientDocumentTypeEnum) documentType?: PatientDocumentTypeEnum;
    @IsOptional() @IsString() documentNumber?: string;

    @IsOptional() @IsString() phone?: string;

    @IsOptional() @IsString() birthDate?: string;
}
