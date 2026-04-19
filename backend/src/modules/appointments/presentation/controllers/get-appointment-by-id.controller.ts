import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { GetAppointmentByIdUseCase } from "../../application/use-cases/get-appointment-by-id.use-case";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";
import { AppointmentResponseDto } from "../dto/appointment-response.dto";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Appointments')
@ApiBearerAuth('access-token')
@Controller('/v1/appointments')
export class GetAppointmentByIdController {
    constructor(private readonly useCase: GetAppointmentByIdUseCase) {}

    @ApiOperation({ summary: 'Obtener cita por id' })
    @ApiParam({ name: 'id', example: '8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a' })
    @ApiOkResponse({ description: 'Cita encontrada' })
    @Get(':id')
    async handle(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const appointment = await this.useCase.execute(id, user);
        const data = {
            id: appointment.id,
            patientId: appointment.patientId,
            recordedByUserId: appointment.recordedByUserId,
            startsAt: appointment.startsAt.toISOString(),
            endsAt: appointment.endsAt?.toISOString(),
            status: appointment.status,
            reason: appointment.reason,
            facilityName: appointment.facilityName,
            facilityAddress: appointment.facilityAddress,
            doctorName: appointment.doctorName,
            specialty: appointment.specialty,
            wasAttended: appointment.wasAttended,
            diagnosis: appointment.diagnosis,
            conclusion: appointment.conclusion,
            followUpNotes: appointment.followUpNotes,
            cancelledReason: appointment.cancelledReason,
            createdAt: appointment.createdAt?.toISOString() ?? '',
            updatedAt: appointment.updatedAt?.toISOString() ?? '',
        } satisfies AppointmentResponseDto;

        return { data };
    }
}

