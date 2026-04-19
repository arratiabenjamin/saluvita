import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReminderLogStatusEnum } from '../../domain/enums/reminder-log-status.enum';

export class UpsertReminderLogDto {
  @ApiProperty({ example: '2026-04-20T11:00:00.000Z' })
  @IsDateString()
  scheduledFor!: string;

  @ApiProperty({ enum: ReminderLogStatusEnum, example: ReminderLogStatusEnum.COMPLETED })
  @IsEnum(ReminderLogStatusEnum)
  status!: ReminderLogStatusEnum;

  @ApiPropertyOptional({ example: 'Paciente en ayuno' })
  @IsOptional()
  @IsString()
  skipReason?: string;
}
