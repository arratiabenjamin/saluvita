import { Controller, Delete, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { DeleteEntryUseCase } from "../../application/use-cases/delete-entry.use-case";
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
export class DeleteEntryController {
    constructor(private readonly useCase: DeleteEntryUseCase) {}

    @ApiOperation({ summary: 'Eliminar entrada del historial (cascadea adjuntos)' })
    @ApiParam({ name: 'patientId' })
    @ApiParam({ name: 'id' })
    @ApiOkResponse({ description: 'Entrada eliminada' })
    @Delete(':id')
    async handle(
        @Param('patientId') patientId: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.useCase.execute(patientId, id, user);
        return { data: result };
    }
}
