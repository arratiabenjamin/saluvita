import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ListRemindersUseCase } from '../../application/use-cases/list-reminders.use-case';
import { ListRemindersQueryDto } from '../dto/list-reminders.dto';
import { CurrentUser } from '../../../../shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/auth/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../../../../shared/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/auth/guards/roles.guard';
import { Roles } from '../../../../shared/auth/decorators/roles.decorator';
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from '../../../../shared/auth/roles.constants';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Reminders')
@ApiBearerAuth('access-token')
@Controller('/v1/reminders')
export class ListRemindersController {
  constructor(private readonly useCase: ListRemindersUseCase) {}

  @ApiOperation({ summary: 'Listar recordatorios (paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'patientId', required: false, example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
  @ApiQuery({ name: 'type', required: false, example: 'MEDICATION' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiQuery({ name: 'search', required: false, example: 'losartán' })
  @ApiOkResponse({ description: 'Listado paginado de recordatorios' })
  @Get()
  async handle(@Query() query: ListRemindersQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.useCase.execute({
      page: query.page,
      limit: query.limit,
      patientId: query.patientId,
      type: query.type,
      isActive: query.isActive,
      search: query.search,
    }, user);
  }
}
