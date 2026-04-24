import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateDependentUseCase } from "../../application/use-cases/create-dependent.use-case";
import { CreateDependentDto } from "../dto/create-dependent.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Caregiving - Dependents')
@ApiBearerAuth('access-token')
@Controller('/v1/me/dependents')
export class CreateDependentController {
    constructor(private readonly useCase: CreateDependentUseCase) {}

    @ApiOperation({ summary: 'Crear paciente dependiente con cuenta propia' })
    @ApiBody({ type: CreateDependentDto })
    @ApiCreatedResponse({ description: 'Dependiente creado y vínculo guardian activo' })
    @Post()
    async handle(
        @Body() dto: CreateDependentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.useCase.execute({
            email: dto.email,
            password: dto.password,
            firstName: dto.firstName,
            lastName: dto.lastName,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            phone: dto.phone,
            relationship: dto.relationship,
            canEditProfile: dto.canEditProfile,
            canManageAppointments: dto.canManageAppointments,
        }, user);

        return { data: result };
    }
}
