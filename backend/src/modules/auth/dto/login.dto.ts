import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'paciente1@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Secret123' })
  @IsString()
  password!: string;
}
