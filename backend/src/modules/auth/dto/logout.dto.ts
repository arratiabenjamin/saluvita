import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ example: 'adb334df8b705eea3a8cb2bc4099cbb9a5f8e2f1532caa3d79e1f9ff1c41a67665eaeac83f15c59fae49aaf1321cc9e8' })
  @IsString()
  refreshToken!: string;
}
