import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CreateManualEntryUseCase } from "../../application/use-cases/create-manual-entry.use-case";
import { CreateManualEntryDto } from "../dto/create-manual-entry.dto";
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
export class CreateManualEntryController {
    constructor(private readonly useCase: CreateManualEntryUseCase) {}

    @ApiOperation({ summary: 'Crear entrada manual en el historial' })
    @ApiParam({ name: 'patientId' })
    @ApiBody({ type: CreateManualEntryDto })
    @ApiCreatedResponse({ description: 'Entrada creada' })
    @Post()
    async handle(
        @Param('patientId') patientId: string,
        @Body() dto: CreateManualEntryDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const created = await this.useCase.execute({
            patientId,
            type: dto.type,
            title: dto.title,
            description: dto.description,
            occurredAt: new Date(dto.occurredAt),
        }, user);
        return { data: created };
    }
}
