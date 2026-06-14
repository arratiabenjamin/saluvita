import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PasswordPolicyDecorators } from './password-policy.validators';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123...' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'NewPass123!',
    description: 'Min 8 chars, uppercase, lowercase, digit and special character required.',
  })
  @PasswordPolicyDecorators()
  password!: string;
}
