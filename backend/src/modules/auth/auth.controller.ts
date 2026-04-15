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
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/auth/interfaces/authenticated-user.interface';

@Controller('/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: any) {
    return {
      data: await this.authService.login(dto, req.headers['user-agent'], req.ip),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: any) {
    return {
      data: await this.authService.refresh(dto, req.headers['user-agent'], req.ip),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return {
      data: await this.authService.logout(dto),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return {
      data: await this.authService.me(user),
    };
  }
}
