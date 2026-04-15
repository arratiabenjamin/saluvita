import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ALLOWED_ROLES } from '../../../shared/auth/roles.constants';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

  @IsOptional()
  @IsArray()
  @IsIn(ALLOWED_ROLES, { each: true })
  roles?: string[];
}
