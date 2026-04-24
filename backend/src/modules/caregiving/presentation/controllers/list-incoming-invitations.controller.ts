import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ListIncomingInvitationsUseCase } from "../../application/use-cases/list-incoming-invitations.use-case";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_PATIENT)
@ApiTags('Caregiving - Invitations')
@ApiBearerAuth('access-token')
@Controller('/v1/me/guardian-invitations')
export class ListIncomingInvitationsController {
    constructor(private readonly useCase: ListIncomingInvitationsUseCase) {}

    @ApiOperation({ summary: 'Listar invitaciones recibidas para cuidarme (pendientes)' })
    @ApiOkResponse({ description: 'Listado de invitaciones entrantes' })
    @Get('incoming')
    async handle(@CurrentUser() user: AuthenticatedUser) {
        return this.useCase.execute(user);
    }
}
