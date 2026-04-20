import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DeactivateReminderUseCase } from '../../application/use-cases/deactivate-reminder.use-case';
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
export class DeactivateReminderController {
  constructor(private readonly useCase: DeactivateReminderUseCase) {}

  @ApiOperation({ summary: 'Desactivar recordatorio' })
  @ApiParam({ name: 'id', example: '5c9d4f76-a31e-4e2a-8c77-19f85ec2ce56' })
  @ApiOkResponse({ description: 'Recordatorio desactivado' })
  @Patch(':id/deactivate')
  async handle(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return { data: await this.useCase.execute(id, user) };
  }
}
