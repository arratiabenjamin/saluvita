import { Controller, ForbiddenException, Get, Query, UseGuards } from "@nestjs/common";
import { ListPatientsQueryDto } from "../dto/list-patients.dto";
import { ListPatientsUseCase } from "../../application/use-cases/list-patients.use-case";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Patients')
@ApiBearerAuth('access-token')
@Controller('/v1/patients')
export class ListPatientsController {
    constructor(private readonly useCase: ListPatientsUseCase) {}

    @ApiOperation({ summary: 'Listar pacientes' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiQuery({ name: 'search', required: false, example: 'Maria' })
    @ApiOkResponse({ description: 'Listado de pacientes paginado' })
    @ApiUnauthorizedResponse({ description: 'Token inválido o faltante' })
    @ApiForbiddenResponse({ description: 'Usuario sin patientId en rol PATIENT' })
    @Get()
    async handle(
        @Query() query: ListPatientsQueryDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const isPatient = user.roles.includes(ROLE_PATIENT);
        if (isPatient && !user.patientId) {
            throw new ForbiddenException('Authenticated user has no patient profile');
        }
        return this.useCase.execute({
            page: query.page,
            limit: query.limit,
            patientId: isPatient ? user.patientId : undefined,
            search: query.search,
        });
    }
}
