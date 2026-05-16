import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ListAppointmentProfessionalsUseCase } from "../../application/use-cases/list-appointment-professionals.use-case";
import {
    AppointmentProfessionalResponseDto,
    ListAppointmentProfessionalsQueryDto,
} from "../dto/list-appointment-professionals.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Appointments')
@ApiBearerAuth('access-token')
@Controller('/v1/appointments')
export class ListAppointmentProfessionalsController {
    constructor(private readonly useCase: ListAppointmentProfessionalsUseCase) {}

    @ApiOperation({
        summary: 'Listar profesionales con los que el paciente ha tenido citas',
    })
    @ApiQuery({ name: 'patientId', required: false, example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    @ApiOkResponse({
        description: 'Profesionales agregados a partir de las citas del paciente',
        type: AppointmentProfessionalResponseDto,
        isArray: true,
    })
    @Get('professionals')
    async handle(
        @Query() query: ListAppointmentProfessionalsQueryDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<AppointmentProfessionalResponseDto[]> {
        const result = await this.useCase.execute({ patientId: query.patientId }, user);

        return result.map((item) => ({
            id: item.id,
            doctorName: item.doctorName,
            specialty: item.specialty,
            facilityName: item.facilityName,
            facilityAddress: item.facilityAddress,
            totalAppointments: item.totalAppointments,
            lastAppointmentAt: item.lastAppointmentAt ? item.lastAppointmentAt.toISOString() : null,
            lastCompletedAt: item.lastCompletedAt ? item.lastCompletedAt.toISOString() : null,
            nextAppointmentAt: item.nextAppointmentAt ? item.nextAppointmentAt.toISOString() : null,
        }));
    }
}
