import { Body, Controller, ForbiddenException, Param, Patch, UseGuards } from "@nestjs/common";
import { UpdatePatientUseCase } from "../../application/use-cases/update-patient.use-case";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";
import {
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Patients')
@ApiBearerAuth('access-token')
@Controller('/v1/patients')
export class UpdatePatientController {
    constructor(private readonly useCase: UpdatePatientUseCase) {}

    @ApiOperation({ summary: 'Actualizar mi perfil de paciente' })
    @ApiBody({ type: UpdatePatientDto })
    @ApiOkResponse({ description: 'Paciente actualizado' })
    @ApiUnauthorizedResponse({ description: 'Token inválido o faltante' })
    @ApiForbiddenResponse({ description: 'Usuario sin patientId' })
    @Patch('me')
    async updateMe(
        @Body() dto: UpdatePatientDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        if (!user.patientId) {
            throw new ForbiddenException('Authenticated user has no patient profile');
        }
        return this.handle(user.patientId, dto, user);
    }

    @ApiOperation({ summary: 'Actualizar paciente por id' })
    @ApiParam({ name: 'id', example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    @ApiBody({ type: UpdatePatientDto })
    @ApiOkResponse({ description: 'Paciente actualizado' })
    @ApiUnauthorizedResponse({ description: 'Token inválido o faltante' })
    @ApiForbiddenResponse({ description: 'Acceso denegado por ownership/rol' })
    @Patch(':id')
    async handle(
        @Param('id') id: string,
        @Body() dto: UpdatePatientDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const isPatient = user.roles.includes(ROLE_PATIENT);
        if (isPatient && user.patientId !== id) {
            throw new ForbiddenException('You can only update your own patient profile');
        }

        const updated = await this.useCase.execute({
            id,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            phone: dto.phone,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            updatedByUserId: user.userId,
        });

        return { data: updated };
    }
}
