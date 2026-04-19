import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { PatientDocumentTypeEnum } from "../../domain/enums/patient-document-type.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePatientDto {
    @ApiProperty({ example: 'Maria' })
    @IsString() firstName!: string;
    @ApiProperty({ example: 'Lopez' })
    @IsString() lastName!: string;

    @ApiPropertyOptional({ example: 'maria@test.com' })
    @IsOptional() @IsEmail() email?: string;

    @ApiProperty({ enum: PatientDocumentTypeEnum, example: PatientDocumentTypeEnum.RUT })
    @IsEnum(PatientDocumentTypeEnum) documentType!: PatientDocumentTypeEnum;
    @ApiProperty({ example: '12345678-9' })
    @IsString() documentNumber!: string;

    @ApiPropertyOptional({ example: '+56911111111' })
    @IsOptional() @IsString() phone?: string;

    @ApiPropertyOptional({ example: '1992-04-10' })
    @IsOptional() @IsString() birthDate?: string;
}
