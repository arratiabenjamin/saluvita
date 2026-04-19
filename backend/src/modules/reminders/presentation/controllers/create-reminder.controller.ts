import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReminderUseCase } from '../../application/use-cases/create-reminder.use-case';
import { CreateReminderDto } from '../dto/create-reminder.dto';
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
export class CreateReminderController {
  constructor(private readonly useCase: CreateReminderUseCase) {}

  @ApiOperation({ summary: 'Crear recordatorio' })
  @ApiBody({ type: CreateReminderDto })
  @ApiCreatedResponse({ description: 'Recordatorio creado correctamente' })
  @Post()
  async handle(@Body() dto: CreateReminderDto, @CurrentUser() user: AuthenticatedUser) {
    const created = await this.useCase.execute({
      patientId: dto.patientId,
      type: dto.type,
      name: dto.name,
      timeOfDay: dto.timeOfDay,
      dosageAmount: dto.dosageAmount,
      frequencyEvery: dto.frequencyEvery,
      frequencyUnit: dto.frequencyUnit,
      startsOn: new Date(dto.startsOn),
      untilOn: dto.untilOn ? new Date(dto.untilOn) : undefined,
      notes: dto.notes,
      isActive: dto.isActive,
    }, user);

    return { data: created };
  }
}
