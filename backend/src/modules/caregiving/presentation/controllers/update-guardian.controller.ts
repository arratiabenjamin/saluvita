import { Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { UpdateGuardianPermissionsUseCase } from "../../application/use-cases/update-guardian-permissions.use-case";
import { UpdateGuardianPermissionsDto } from "../dto/update-guardian-permissions.dto";
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
@Controller('/v1/guardians')
export class UpdateGuardianController {
    constructor(private readonly useCase: UpdateGuardianPermissionsUseCase) {}

    @ApiOperation({ summary: 'Actualizar permisos de un guardian' })
    @ApiParam({ name: 'id', example: '3e1a...' })
    @ApiBody({ type: UpdateGuardianPermissionsDto })
    @ApiOkResponse({ description: 'Permisos actualizados' })
    @Patch(':id')
    async handle(
        @Param('id') id: string,
        @Body() dto: UpdateGuardianPermissionsDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.useCase.execute({
            guardianLinkId: id,
            canEditProfile: dto.canEditProfile,
            canManageAppointments: dto.canManageAppointments,
        }, user);
        return { data: result };
    }
}
