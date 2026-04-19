import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ListAppointmentsUseCase } from "../../application/use-cases/list-appointments.use-case";
import { ListAppointmentsQueryDto } from "../dto/list-appointments.dto";
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
export class ListAppointmentsController {
    constructor(private readonly useCase: ListAppointmentsUseCase) {}

    @ApiOperation({ summary: 'Listar citas (paginado)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiQuery({ name: 'patientId', required: false, example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    @ApiQuery({ name: 'status', required: false, example: 'PLANNED' })
    @ApiQuery({ name: 'from', required: false, example: '2026-05-01T00:00:00.000Z' })
    @ApiQuery({ name: 'to', required: false, example: '2026-05-31T23:59:59.000Z' })
    @ApiQuery({ name: 'search', required: false, example: 'control' })
    @ApiOkResponse({ description: 'Listado paginado de citas' })
    @Get()
    async handle(
        @Query() query: ListAppointmentsQueryDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.useCase.execute({
            page: query.page,
            limit: query.limit,
            patientId: query.patientId,
            status: query.status,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
            search: query.search,
        }, user);
    }
}

