import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ALLOWED_ROLES } from '../../../shared/auth/roles.constants';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Admin' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'User' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Secret123', minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

  @ApiPropertyOptional({ example: ['ADMIN'], isArray: true, enum: ALLOWED_ROLES })
  @IsOptional()
  @IsArray()
  @IsIn(ALLOWED_ROLES, { each: true })
  roles?: string[];
}
