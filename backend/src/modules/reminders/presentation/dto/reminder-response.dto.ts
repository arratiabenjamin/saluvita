import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderFrequencyUnitEnum } from '../../domain/enums/reminder-frequency-unit.enum';
import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';

export class ReminderResponseDto {
  @ApiProperty({ example: '5c9d4f76-a31e-4e2a-8c77-19f85ec2ce56' })
  id!: string;

  @ApiProperty({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
  patientId!: string;

  @ApiProperty({ enum: ReminderTypeEnum })
  type!: ReminderTypeEnum;

  @ApiProperty({ example: 'Losartán' })
  name!: string;

  @ApiProperty({ example: '08:00' })
  timeOfDay!: string;

  @ApiPropertyOptional({ example: '1 comprimido' })
  dosageAmount?: string;

  @ApiProperty({ example: 8 })
  frequencyEvery!: number;

  @ApiProperty({ enum: ReminderFrequencyUnitEnum })
  frequencyUnit!: ReminderFrequencyUnitEnum;

  @ApiProperty({ example: '2026-04-20T00:00:00.000Z' })
  startsOn!: string;

  @ApiPropertyOptional({ example: '2026-05-20T00:00:00.000Z' })
  untilOn?: string;

  @ApiPropertyOptional({ example: 'Tomar con comida' })
  notes?: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-04-20T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-20T12:00:00.000Z' })
  updatedAt!: string;
}
