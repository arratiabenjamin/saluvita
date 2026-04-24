import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export class UpdateEntryDto {
    @ApiPropertyOptional({ enum: MedicalHistoryTypeEnum })
    @IsOptional()
    @IsEnum(MedicalHistoryTypeEnum)
    type?: MedicalHistoryTypeEnum;

    @ApiPropertyOptional({ example: 'Examen de sangre actualizado', maxLength: 160 })
    @IsOptional()
    @IsString()
    @MaxLength(160)
    title?: string;

    @ApiPropertyOptional({ example: 'Hemograma completo - ampliado con perfil lipídico' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: '2026-04-20T10:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    occurredAt?: string;
}
