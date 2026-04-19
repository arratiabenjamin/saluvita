import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreateAppointmentUseCase } from "../../application/use-cases/create-appointment.use-case";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Appointments')
@ApiBearerAuth('access-token')
@Controller('/v1/appointments')
export class CreateAppointmentController {
    constructor(private readonly useCase: CreateAppointmentUseCase) {}

    @ApiOperation({ summary: 'Crear cita médica' })
    @ApiBody({ type: CreateAppointmentDto })
    @ApiCreatedResponse({ description: 'Cita creada correctamente' })
    @Post()
    async handle(
        @Body() dto: CreateAppointmentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const created = await this.useCase.execute({
            patientId: dto.patientId,
            startsAt: new Date(dto.startsAt),
            endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
            reason: dto.reason,
            facilityName: dto.facilityName,
            facilityAddress: dto.facilityAddress,
            doctorName: dto.doctorName,
            specialty: dto.specialty,
        }, user);

        return { data: created };
    }
}

