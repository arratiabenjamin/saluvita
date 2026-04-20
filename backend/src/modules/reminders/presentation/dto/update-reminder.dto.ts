import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { ReminderFrequencyUnitEnum } from '../../domain/enums/reminder-frequency-unit.enum';
import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';

export class UpdateReminderDto {
  @ApiPropertyOptional({ enum: ReminderTypeEnum, example: ReminderTypeEnum.MEDICATION })
  @IsOptional()
  @IsEnum(ReminderTypeEnum)
  type?: ReminderTypeEnum;

  @ApiPropertyOptional({ example: 'Losartán' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  timeOfDay?: string;

  @ApiPropertyOptional({ example: '1 comprimido' })
  @IsOptional()
  @IsString()
  dosageAmount?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  frequencyEvery?: number;

  @ApiPropertyOptional({ enum: ReminderFrequencyUnitEnum, example: ReminderFrequencyUnitEnum.HOURS })
  @IsOptional()
  @IsEnum(ReminderFrequencyUnitEnum)
  frequencyUnit?: ReminderFrequencyUnitEnum;

  @ApiPropertyOptional({ example: '2026-04-20' })
  @IsOptional()
  @IsDateString()
  startsOn?: string;

  @ApiPropertyOptional({ example: '2026-05-20' })
  @IsOptional()
  @IsDateString()
  untilOn?: string;

  @ApiPropertyOptional({ example: 'Tomar con comida' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
