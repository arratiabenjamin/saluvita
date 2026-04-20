import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';
import { ReminderFrequencyUnitEnum } from '../../domain/enums/reminder-frequency-unit.enum';
import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';

export class CreateReminderDto {
  @ApiProperty({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
  @IsUUID()
  patientId!: string;

  @ApiProperty({ enum: ReminderTypeEnum, example: ReminderTypeEnum.MEDICATION })
  @IsEnum(ReminderTypeEnum)
  type!: ReminderTypeEnum;

  @ApiProperty({ example: 'Losartán' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '08:00', description: 'Formato HH:mm' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  timeOfDay!: string;

  @ApiPropertyOptional({ example: '1 comprimido', description: 'Requerido cuando type=MEDICATION' })
  @IsOptional()
  @IsString()
  dosageAmount?: string;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  @Max(999)
  frequencyEvery!: number;

  @ApiProperty({ enum: ReminderFrequencyUnitEnum, example: ReminderFrequencyUnitEnum.HOURS })
  @IsEnum(ReminderFrequencyUnitEnum)
  frequencyUnit!: ReminderFrequencyUnitEnum;

  @ApiProperty({ example: '2026-04-20' })
  @IsDateString()
  startsOn!: string;

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
