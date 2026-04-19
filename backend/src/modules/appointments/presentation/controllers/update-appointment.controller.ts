import { Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { UpdateAppointmentUseCase } from "../../application/use-cases/update-appointment.use-case";
import { UpdateAppointmentDto } from "../dto/update-appointment.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Appointments')
@ApiBearerAuth('access-token')
@Controller('/v1/appointments')
export class UpdateAppointmentController {
    constructor(private readonly useCase: UpdateAppointmentUseCase) {}

    @ApiOperation({ summary: 'Actualizar cita (estado PLANNED)' })
    @ApiParam({ name: 'id', example: '8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a' })
    @ApiBody({ type: UpdateAppointmentDto })
    @ApiOkResponse({ description: 'Cita actualizada' })
    @Patch(':id')
    async handle(
        @Param('id') id: string,
        @Body() dto: UpdateAppointmentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const updated = await this.useCase.execute({
            id,
            startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
            endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
            reason: dto.reason,
            facilityName: dto.facilityName,
            facilityAddress: dto.facilityAddress,
            doctorName: dto.doctorName,
            specialty: dto.specialty,
        }, user);

        return { data: updated };
    }
}

