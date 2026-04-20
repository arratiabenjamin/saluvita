import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetReminderByIdUseCase } from '../../application/use-cases/get-reminder-by-id.use-case';
import { CurrentUser } from '../../../../shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/auth/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../../../../shared/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/auth/guards/roles.guard';
import { Roles } from '../../../../shared/auth/decorators/roles.decorator';
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from '../../../../shared/auth/roles.constants';
import { ReminderResponseDto } from '../dto/reminder-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Reminders')
@ApiBearerAuth('access-token')
@Controller('/v1/reminders')
export class GetReminderByIdController {
  constructor(private readonly useCase: GetReminderByIdUseCase) {}

  @ApiOperation({ summary: 'Obtener recordatorio por id' })
  @ApiParam({ name: 'id', example: '5c9d4f76-a31e-4e2a-8c77-19f85ec2ce56' })
  @ApiOkResponse({ description: 'Recordatorio encontrado' })
  @Get(':id')
  async handle(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const reminder = await this.useCase.execute(id, user);

    const data = {
      id: reminder.id,
      patientId: reminder.patientId,
      type: reminder.type,
      name: reminder.name,
      timeOfDay: reminder.timeOfDay,
      dosageAmount: reminder.dosageAmount,
      frequencyEvery: reminder.frequencyEvery,
      frequencyUnit: reminder.frequencyUnit,
      startsOn: reminder.startsOn.toISOString(),
      untilOn: reminder.untilOn?.toISOString(),
      notes: reminder.notes,
      isActive: reminder.isActive,
      createdAt: reminder.createdAt?.toISOString() ?? '',
      updatedAt: reminder.updatedAt?.toISOString() ?? '',
    } satisfies ReminderResponseDto;

    return { data };
  }
}
