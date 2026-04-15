import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ALLOWED_ROLES } from '../../../shared/auth/roles.constants';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsArray()
  @IsIn(ALLOWED_ROLES, { each: true })
  roles!: string[];

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}
