import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { PatientDocumentTypeEnum } from "../../domain/enums/patient-document-type.enum";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePatientDto {
    @ApiPropertyOptional({ example: 'Maria' })
    @IsOptional() @IsString() firstName!: string;
    @ApiPropertyOptional({ example: 'Lopez' })
    @IsOptional() @IsString() lastName!: string;

    @ApiPropertyOptional({ example: 'maria@test.com' })
    @IsOptional() @IsEmail() email?: string;

    @ApiPropertyOptional({ enum: PatientDocumentTypeEnum, example: PatientDocumentTypeEnum.RUT })
    @IsOptional() @IsEnum(PatientDocumentTypeEnum) documentType?: PatientDocumentTypeEnum;
    @ApiPropertyOptional({ example: '12345678-9' })
    @IsOptional() @IsString() documentNumber?: string;

    @ApiPropertyOptional({ example: '+56911111111' })
    @IsOptional() @IsString() phone?: string;

    @ApiPropertyOptional({ example: '1992-04-10' })
    @IsOptional() @IsString() birthDate?: string;
}
