import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InviteGuardianUseCase } from "../../application/use-cases/invite-guardian.use-case";
import { ListOutgoingInvitationsUseCase } from "../../application/use-cases/list-outgoing-invitations.use-case";
import { InviteGuardianDto } from "../dto/invite-guardian.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Caregiving - Invitations')
@ApiBearerAuth('access-token')
@Controller('/v1/me/guardian-invitations')
export class InviteGuardianController {
    constructor(
        private readonly inviteUseCase: InviteGuardianUseCase,
        private readonly listOutgoingUseCase: ListOutgoingInvitationsUseCase,
    ) {}

    @ApiOperation({
        summary: 'Invitar a un paciente existente para cuidarlo',
        description: 'Crea una invitación pendiente que el paciente debe aceptar. Devuelve el token.',
    })
    @ApiBody({ type: InviteGuardianDto })
    @ApiCreatedResponse({ description: 'Invitación creada' })
    @Post()
    async createInvitation(
        @Body() dto: InviteGuardianDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.inviteUseCase.execute({
            targetPatientEmail: dto.targetPatientEmail,
            relationship: dto.relationship,
            canEditProfile: dto.canEditProfile,
            canManageAppointments: dto.canManageAppointments,
        }, user);
        return { data: result };
    }

    @ApiOperation({ summary: 'Listar invitaciones que yo envié y están pendientes' })
    @ApiOkResponse({ description: 'Listado de invitaciones salientes' })
    @Get('outgoing')
    async listOutgoing(@CurrentUser() user: AuthenticatedUser) {
        return this.listOutgoingUseCase.execute(user);
    }
}
