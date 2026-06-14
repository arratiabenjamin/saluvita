import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import type { AuthenticatedUser } from '../../shared/auth/interfaces/authenticated-user.interface';
import { ROLE_PATIENT } from '../../shared/auth/roles.constants';
import { EMAIL_SENDER, EmailSender } from '../email/email.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_SENDER) private readonly emailSender: EmailSender,
  ) {}

  private accessSecret(): string {
    return this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret';
  }

  private accessExpiresIn(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
  }

  private refreshTtlDays(): number {
    return Number(this.configService.get<string>('JWT_REFRESH_TTL_DAYS') ?? 30);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createRefreshToken(userId: string, userAgent?: string, ipAddress?: string) {
    const refreshToken = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTtlDays());

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return refreshToken;
  }

  private async getUserRoles(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    return rows.map((row) => row.role.code);
  }

  private async buildAuthResponse(userId: string, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { patientProfile: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const roles = await this.getUserRoles(user.id);
    const payload = {
      sub: user.id,
      email: user.email,
      roles,
      patientId: user.patientProfile?.id,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret(),
      expiresIn: this.accessExpiresIn() as any,
    });

    const refreshToken = await this.createRefreshToken(user.id, userAgent, ipAddress);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        roles,
        patientId: user.patientProfile?.id ?? null,
      },
    };
  }

  async registerPatient(dto: RegisterPatientDto, userAgent?: string, ipAddress?: string) {
    const email = dto.email.trim().toLowerCase();
    const documentNumber = dto.documentNumber.trim().toUpperCase();

    const existingUser = await this.prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (existingUser) throw new ConflictException('Email already in use');

    const existingPatient = await this.prisma.patient.findFirst({
      where: {
        documentType: dto.documentType,
        documentNumber,
        deletedAt: null,
      },
    });

    if (existingPatient) throw new ConflictException('Patient document already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const patientRole = await tx.role.upsert({
        where: { code: ROLE_PATIENT },
        create: { code: ROLE_PATIENT, name: 'Patient' },
        update: {},
      });

      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          status: 'ACTIVE',
        },
      });

      await tx.userRole.create({
        data: {
          userId: createdUser.id,
          roleId: patientRole.id,
        },
      });

      await tx.patient.create({
        data: {
          userId: createdUser.id,
          documentType: dto.documentType,
          documentNumber,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          email,
          phone: dto.phone?.trim(),
          createdByUserId: createdUser.id,
        },
      });

      return createdUser;
    });

    return this.buildAuthResponse(user.id, userAgent, ipAddress);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      console.error(`[AUTH] Usuario no encontrado: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    if (user.status !== 'ACTIVE') {
      console.warn(`[AUTH] Usuario inactivo: ${email} - Status: ${user.status}`);
      throw new ForbiddenException(`User status is ${user.status}`);
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    console.log(`[AUTH] Validación bcrypt para ${email}: ${validPassword}`);
    
    if (!validPassword) {
      console.error(`[AUTH] Contraseña inválida para: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildAuthResponse(user.id, userAgent, ipAddress);
  }

  async refresh(dto: RefreshTokenDto, userAgent?: string, ipAddress?: string) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const session = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.buildAuthResponse(session.userId, userAgent, ipAddress);
  }

  async logout(dto: LogoutDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return { ok: true };
  }

  async me(user: AuthenticatedUser) {
    const dbUser = await this.prisma.user.findFirst({
      where: { id: user.userId, deletedAt: null },
      include: { patientProfile: true },
    });

    if (!dbUser) throw new UnauthorizedException('User not found');

    const roles = await this.getUserRoles(dbUser.id);

    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      status: dbUser.status,
      roles,
      patientId: dbUser.patientProfile?.id ?? null,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const genericMessage = 'If that email is registered, a reset link is on its way.';

    const user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null, status: 'ACTIVE' },
    });

    if (!user) {
      return { message: genericMessage };
    }

    const rawToken = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const ttlMinutes = Number(
      this.configService.get<string>('PASSWORD_RESET_TTL_MINUTES') ?? '60',
    );
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrlBase =
      this.configService.get<string>('APP_RESET_URL_BASE') ??
      'http://localhost:5173/reset-password';
    const resetLink = `${resetUrlBase}?token=${rawToken}`;

    await this.emailSender.sendPasswordResetEmail(user.email, resetLink);

    return { message: genericMessage };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    await this.prisma.$transaction(async (tx) => {
      const tokenRecord = await tx.passwordResetToken.findFirst({
        where: {
          tokenHash,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new BadRequestException('Invalid, expired, or already used reset token.');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });

      await tx.refreshToken.updateMany({
        where: { userId: tokenRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
  }
}
