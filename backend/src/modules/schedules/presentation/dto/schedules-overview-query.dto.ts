import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum SchedulesViewEnum {
  TODAY = 'today',
  WEEK = 'week',
  UPCOMING = 'upcoming',
}

export class SchedulesOverviewQueryDto {
  @ApiPropertyOptional({ enum: SchedulesViewEnum, example: SchedulesViewEnum.TODAY, default: SchedulesViewEnum.TODAY })
  @IsOptional()
  @IsEnum(SchedulesViewEnum)
  view: SchedulesViewEnum = SchedulesViewEnum.TODAY;

  @ApiPropertyOptional({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
  @IsOptional()
  @IsUUID()
  patientId?: string;
}
