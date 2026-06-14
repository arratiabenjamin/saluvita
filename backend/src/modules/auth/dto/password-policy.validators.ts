import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MinLength } from 'class-validator';

export const PASSWORD_REGEX = {
  minLength: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
};

export function PasswordPolicyDecorators() {
  return applyDecorators(
    IsString(),
    MinLength(PASSWORD_REGEX.minLength, {
      message: `Password must be at least ${PASSWORD_REGEX.minLength} characters`,
    }),
    Matches(PASSWORD_REGEX.uppercase, {
      message: 'Password must contain at least one uppercase letter',
    }),
    Matches(PASSWORD_REGEX.lowercase, {
      message: 'Password must contain at least one lowercase letter',
    }),
    Matches(PASSWORD_REGEX.digit, {
      message: 'Password must contain at least one digit',
    }),
    Matches(PASSWORD_REGEX.special, {
      message: 'Password must contain at least one special character',
    }),
  );
}
