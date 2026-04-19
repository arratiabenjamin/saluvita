import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpsertReminderLogUseCase } from '../../application/use-cases/upsert-reminder-log.use-case';
import { UpsertReminderLogDto } from '../dto/upsert-reminder-log.dto';
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
export class UpsertReminderLogController {
  constructor(private readonly useCase: UpsertReminderLogUseCase) {}

  @ApiOperation({ summary: 'Crear/actualizar estado de una ocurrencia de recordatorio' })
  @ApiParam({ name: 'id', example: '5c9d4f76-a31e-4e2a-8c77-19f85ec2ce56' })
  @ApiBody({ type: UpsertReminderLogDto })
  @ApiOkResponse({ description: 'Log de recordatorio actualizado' })
  @Put(':id/logs')
  async handle(
    @Param('id') reminderId: string,
    @Body() dto: UpsertReminderLogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.useCase.execute({
      reminderId,
      scheduledFor: new Date(dto.scheduledFor),
      status: dto.status,
      skipReason: dto.skipReason,
    }, user);

    return { data: result };
  }
}
