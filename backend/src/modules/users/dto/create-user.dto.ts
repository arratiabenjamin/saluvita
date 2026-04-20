import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ALLOWED_ROLES } from '../../../shared/auth/roles.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'User' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: ['ADMIN'], isArray: true, enum: ALLOWED_ROLES })
  @IsArray()
  @IsIn(ALLOWED_ROLES, { each: true })
  roles!: string[];

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}
