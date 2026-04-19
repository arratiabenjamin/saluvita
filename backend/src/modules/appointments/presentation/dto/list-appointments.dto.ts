import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { AppointmentStatusEnum } from "../../domain/enums/appointment-status.enum";

export class ListAppointmentsQueryDto {
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

    @ApiPropertyOptional({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    @IsOptional()
    @IsUUID()
    patientId?: string;

    @ApiPropertyOptional({ enum: AppointmentStatusEnum, example: AppointmentStatusEnum.PLANNED })
    @IsOptional()
    @IsEnum(AppointmentStatusEnum)
    status?: AppointmentStatusEnum;

    @ApiPropertyOptional({ example: '2026-05-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ example: '2026-05-31T23:59:59.000Z' })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional({ example: 'control' })
    @IsOptional()
    @IsString()
    search?: string;
}

