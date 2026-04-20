import { Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { CancelAppointmentUseCase } from "../../application/use-cases/cancel-appointment.use-case";
import { CancelAppointmentDto } from "../dto/cancel-appointment.dto";
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
export class CancelAppointmentController {
    constructor(private readonly useCase: CancelAppointmentUseCase) {}

    @ApiOperation({ summary: 'Cancelar cita (estado CANCELLED)' })
    @ApiParam({ name: 'id', example: '8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a' })
    @ApiBody({ type: CancelAppointmentDto })
    @ApiOkResponse({ description: 'Cita cancelada' })
    @Patch(':id/cancel')
    async handle(
        @Param('id') id: string,
        @Body() dto: CancelAppointmentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const cancelled = await this.useCase.execute({
            id,
            cancelledReason: dto.cancelledReason,
        }, user);

        return { data: cancelled };
    }
}

