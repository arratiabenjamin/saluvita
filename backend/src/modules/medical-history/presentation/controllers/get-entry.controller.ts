import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { GetEntryUseCase } from "../../application/use-cases/get-entry.use-case";
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
export class GetEntryController {
    constructor(private readonly useCase: GetEntryUseCase) {}

    @ApiOperation({ summary: 'Obtener una entrada del historial por ID' })
    @ApiParam({ name: 'patientId' })
    @ApiParam({ name: 'id' })
    @ApiOkResponse({ description: 'Entrada del historial' })
    @Get(':id')
    async handle(
        @Param('patientId') patientId: string,
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.useCase.execute(patientId, id, user);
    }
}
