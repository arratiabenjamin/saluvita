import { Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { CompleteAppointmentUseCase } from "../../application/use-cases/complete-appointment.use-case";
import { CompleteAppointmentDto } from "../dto/complete-appointment.dto";
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
export class CompleteAppointmentController {
    constructor(private readonly useCase: CompleteAppointmentUseCase) {}

    @ApiOperation({ summary: 'Marcar cita como COMPLETED' })
    @ApiParam({ name: 'id', example: '8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a' })
    @ApiBody({ type: CompleteAppointmentDto })
    @ApiOkResponse({ description: 'Cita completada' })
    @Patch(':id/complete')
    async handle(
        @Param('id') id: string,
        @Body() dto: CompleteAppointmentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const completed = await this.useCase.execute({
            id,
            endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
            wasAttended: dto.wasAttended,
            diagnosis: dto.diagnosis,
            conclusion: dto.conclusion,
            followUpNotes: dto.followUpNotes,
        }, user);

        return { data: completed };
    }
}

