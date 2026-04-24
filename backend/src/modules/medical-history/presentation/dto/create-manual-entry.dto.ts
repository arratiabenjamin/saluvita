import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export class CreateManualEntryDto {
    @ApiProperty({ enum: MedicalHistoryTypeEnum, example: MedicalHistoryTypeEnum.PATIENT_NOTE })
    @IsEnum(MedicalHistoryTypeEnum)
    type!: MedicalHistoryTypeEnum;

    @ApiProperty({ example: 'Examen de sangre', maxLength: 160 })
    @IsString()
    @MaxLength(160)
    title!: string;

    @ApiPropertyOptional({ example: 'Hemograma completo solicitado por control general.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '2026-04-20T10:00:00.000Z' })
    @IsDateString()
    occurredAt!: string;
}
