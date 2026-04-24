import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ListDependentsUseCase } from "../../application/use-cases/list-dependents.use-case";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Caregiving - Dependents')
@ApiBearerAuth('access-token')
@Controller('/v1/me/dependents')
export class ListDependentsController {
    constructor(private readonly useCase: ListDependentsUseCase) {}

    @ApiOperation({ summary: 'Listar pacientes dependientes que yo cuido' })
    @ApiOkResponse({ description: 'Listado de dependientes activos' })
    @Get()
    async handle(@CurrentUser() user: AuthenticatedUser) {
        return this.useCase.execute(user);
    }
}
