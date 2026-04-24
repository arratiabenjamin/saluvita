import { Controller, Delete, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { RevokeGuardianUseCase } from "../../application/use-cases/revoke-guardian.use-case";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Caregiving - Guardians')
@ApiBearerAuth('access-token')
@Controller('/v1/guardians')
export class RevokeGuardianController {
    constructor(private readonly useCase: RevokeGuardianUseCase) {}

    @ApiOperation({ summary: 'Revocar vínculo de guardian (paciente o guardian)' })
    @ApiParam({ name: 'id', example: '3e1a...' })
    @ApiOkResponse({ description: 'Vínculo revocado' })
    @Delete(':id')
    async handle(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.useCase.execute(id, user);
        return { data: result };
    }
}
