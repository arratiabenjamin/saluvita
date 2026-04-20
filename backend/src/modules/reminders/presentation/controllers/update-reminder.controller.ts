import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateReminderUseCase } from '../../application/use-cases/update-reminder.use-case';
import { UpdateReminderDto } from '../dto/update-reminder.dto';
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
export class UpdateReminderController {
  constructor(private readonly useCase: UpdateReminderUseCase) {}

  @ApiOperation({ summary: 'Actualizar recordatorio' })
  @ApiParam({ name: 'id', example: '5c9d4f76-a31e-4e2a-8c77-19f85ec2ce56' })
  @ApiBody({ type: UpdateReminderDto })
  @ApiOkResponse({ description: 'Recordatorio actualizado' })
  @Patch(':id')
  async handle(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const updated = await this.useCase.execute({
      id,
      type: dto.type,
      name: dto.name,
      timeOfDay: dto.timeOfDay,
      dosageAmount: dto.dosageAmount,
      frequencyEvery: dto.frequencyEvery,
      frequencyUnit: dto.frequencyUnit,
      startsOn: dto.startsOn ? new Date(dto.startsOn) : undefined,
      untilOn: dto.untilOn ? new Date(dto.untilOn) : undefined,
      notes: dto.notes,
      isActive: dto.isActive,
    }, user);

    return { data: updated };
  }
}
