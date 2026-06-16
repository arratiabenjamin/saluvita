import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/auth/interfaces/authenticated-user.interface';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar paciente' })
  @ApiBody({ type: RegisterPatientDto })
  @ApiOkResponse({ description: 'Usuario registrado correctamente' })
  @Post('register')
  async register(@Body() dto: RegisterPatientDto, @Req() req: any) {
    return {
      data: await this.authService.registerPatient(
        dto,
        req.headers['user-agent'],
        req.ip,
      ),
    };
  }

  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login exitoso' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: any) {
    return {
      data: await this.authService.login(dto, req.headers['user-agent'], req.ip),
    };
  }

  @ApiOperation({ summary: 'Renovar access token con refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Token renovado correctamente' })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: any) {
    return {
      data: await this.authService.refresh(dto, req.headers['user-agent'], req.ip),
    };
  }

  @ApiOperation({ summary: 'Cerrar sesión (revocar refresh token)' })
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({ description: 'Sesión cerrada' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return {
      data: await this.authService.logout(dto),
    };
  }

  @ApiOperation({ summary: 'Obtener usuario autenticado actual' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Perfil autenticado' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o expirado' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return {
      data: await this.authService.me(user),
    };
  }

  @ApiOperation({ summary: 'Solicitar enlace de recuperación de contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ description: 'Respuesta genérica (anti-enumeración)' })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return {
      data: await this.authService.forgotPassword(dto.email),
    };
  }

  @ApiOperation({ summary: 'Resetear contraseña con token de recuperación' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Contraseña actualizada' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return {
      data: { ok: true },
    };
  }
}
