import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/auth/guards/roles.guard';
import { Roles } from '../../../../shared/auth/decorators/roles.decorator';
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from '../../../../shared/auth/roles.constants';
import { CurrentUser } from '../../../../shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/auth/interfaces/authenticated-user.interface';
import { DashboardService } from '../../infrastructure/dashboard.service';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

class DashboardOverviewQueryDto {
  @ApiPropertyOptional({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
  @IsOptional()
  @IsUUID()
  patientId?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('/v1/dashboard')
export class GetDashboardOverviewController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Obtener overview del dashboard' })
  @ApiQuery({ name: 'patientId', required: false, example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
  @ApiOkResponse({ description: 'Overview de dashboard generado' })
  @Get('overview')
  async handle(@Query() query: DashboardOverviewQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.overview(user, query.patientId);
  }
}
