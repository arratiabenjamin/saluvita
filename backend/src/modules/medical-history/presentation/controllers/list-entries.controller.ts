import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ListEntriesUseCase } from "../../application/use-cases/list-entries.use-case";
import { ListEntriesQueryDto } from "../dto/list-entries.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Medical History')
@ApiBearerAuth('access-token')
@Controller('/v1/patients/:patientId/medical-history')
export class ListEntriesController {
    constructor(private readonly useCase: ListEntriesUseCase) {}

    @ApiOperation({ summary: 'Listar historial médico (paginado)' })
    @ApiParam({ name: 'patientId' })
    @ApiOkResponse({ description: 'Listado paginado de entradas de historial' })
    @Get()
    async handle(
        @Param('patientId') patientId: string,
        @Query() query: ListEntriesQueryDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.useCase.execute({
            patientId,
            source: query.source,
            type: query.type,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
            page: query.page,
            limit: query.limit,
        }, user);
    }
}
