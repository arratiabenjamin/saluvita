import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ListMyGuardiansUseCase } from "../../application/use-cases/list-my-guardians.use-case";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_PATIENT)
@ApiTags('Caregiving - Guardians')
@ApiBearerAuth('access-token')
@Controller('/v1/me/guardians')
export class ListMyGuardiansController {
    constructor(private readonly useCase: ListMyGuardiansUseCase) {}

    @ApiOperation({ summary: 'Listar personas que son guardians de mi perfil' })
    @ApiOkResponse({ description: 'Listado de guardians activos' })
    @Get()
    async handle(@CurrentUser() user: AuthenticatedUser) {
        return this.useCase.execute(user);
    }
}
