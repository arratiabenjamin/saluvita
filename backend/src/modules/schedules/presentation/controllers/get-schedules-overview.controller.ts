import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/auth/guards/roles.guard';
import { Roles } from '../../../../shared/auth/decorators/roles.decorator';
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from '../../../../shared/auth/roles.constants';
import { CurrentUser } from '../../../../shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/auth/interfaces/authenticated-user.interface';
import { SchedulesService } from '../../infrastructure/schedules.service';
import { SchedulesOverviewQueryDto } from '../dto/schedules-overview-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Schedules')
@ApiBearerAuth('access-token')
@Controller('/v1/schedules')
export class GetSchedulesOverviewController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @ApiOperation({ summary: 'Obtener overview de horarios y recordatorios (sin citas)' })
  @ApiQuery({ name: 'view', required: false, example: 'today' })
  @ApiQuery({ name: 'patientId', required: false, example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
  @ApiOkResponse({ description: 'Overview de schedules generado' })
  @Get('overview')
  async handle(@Query() query: SchedulesOverviewQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.schedulesService.overview(query.view, user, query.patientId);
  }
}
