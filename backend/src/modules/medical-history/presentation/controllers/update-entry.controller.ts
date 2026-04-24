import { Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { UpdateEntryUseCase } from "../../application/use-cases/update-entry.use-case";
import { UpdateEntryDto } from "../dto/update-entry.dto";
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
export class UpdateEntryController {
    constructor(private readonly useCase: UpdateEntryUseCase) {}

    @ApiOperation({ summary: 'Actualizar entrada del historial (queda auditada)' })
    @ApiParam({ name: 'patientId' })
    @ApiParam({ name: 'id' })
    @ApiBody({ type: UpdateEntryDto })
    @ApiOkResponse({ description: 'Entrada actualizada' })
    @Patch(':id')
    async handle(
        @Param('patientId') patientId: string,
        @Param('id') id: string,
        @Body() dto: UpdateEntryDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.useCase.execute({
            patientId,
            entryId: id,
            type: dto.type,
            title: dto.title,
            description: dto.description,
            occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
        }, user);
        return { data: result };
    }
}
