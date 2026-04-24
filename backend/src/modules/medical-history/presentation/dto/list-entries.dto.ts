import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { MedicalHistorySourceEnum } from "../../domain/enums/medical-history-source.enum";
import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export class ListEntriesQueryDto {
    @ApiPropertyOptional({ example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;

    @ApiPropertyOptional({ enum: MedicalHistorySourceEnum })
    @IsOptional()
    @IsEnum(MedicalHistorySourceEnum)
    source?: MedicalHistorySourceEnum;

    @ApiPropertyOptional({ enum: MedicalHistoryTypeEnum })
    @IsOptional()
    @IsEnum(MedicalHistoryTypeEnum)
    type?: MedicalHistoryTypeEnum;

    @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
    @IsOptional()
    @IsDateString()
    to?: string;
}
