import { describe, it, expect } from 'vitest';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth-schemas';

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'valid123' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'valid123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === 'email');
      expect(emailError).toBeDefined();
    }
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find((i) => i.path[0] === 'password');
      expect(pwError).toBeDefined();
    }
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '12345' });
    expect(result.success).toBe(false);
  });

  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'valid123',
    });
    expect(result.success).toBe(true);
  });
});

// ─── forgotPasswordSchema ─────────────────────────────────────────────────────

describe('forgotPasswordSchema', () => {
  it('rejects an invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'bad-email' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });
});

// ─── resetPasswordSchema ──────────────────────────────────────────────────────

describe('resetPasswordSchema', () => {
  it('rejects a password shorter than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Ab1!',
      confirmPassword: 'Ab1!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no uppercase letter', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'validpassword1!',
      confirmPassword: 'validpassword1!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no lowercase letter', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'VALIDPASSWORD1!',
      confirmPassword: 'VALIDPASSWORD1!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no number', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'ValidPassword!',
      confirmPassword: 'ValidPassword!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password with no special character', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'ValidPassword1',
      confirmPassword: 'ValidPassword1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'ValidPass1!',
      confirmPassword: 'Different1!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const mismatchError = result.error.issues.find((i) => i.path[0] === 'confirmPassword');
      expect(mismatchError).toBeDefined();
      expect(mismatchError?.message).toMatch(/coinciden/i);
    }
  });

  it('accepts a valid password with matching confirmation', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'ValidPass1!',
      confirmPassword: 'ValidPass1!',
    });
    expect(result.success).toBe(true);
  });
});
