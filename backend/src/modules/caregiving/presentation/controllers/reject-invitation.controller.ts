import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { RejectGuardianInvitationUseCase } from "../../application/use-cases/reject-guardian-invitation.use-case";
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
@Controller('/v1/guardian-invitations')
export class RejectInvitationController {
    constructor(private readonly useCase: RejectGuardianInvitationUseCase) {}

    @ApiOperation({ summary: 'Rechazar invitación de guardian' })
    @ApiParam({ name: 'token', example: 'abc123...' })
    @ApiOkResponse({ description: 'Invitación rechazada' })
    @Post(':token/reject')
    async handle(
        @Param('token') token: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.useCase.execute(token, user);
        return { data: result };
    }
}
