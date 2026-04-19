import { Controller, ForbiddenException, Get, Param, UseGuards } from "@nestjs/common";
import { GetPatientByIdUseCase } from "../../application/use-cases/get-patient-by-id.use-case";
import { PatientResponseDto } from "../dto/patient-response.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";
import {
    ApiBearerAuth,
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
export class GetPatientByIdController {
    constructor(private readonly useCase: GetPatientByIdUseCase) {}

    @ApiOperation({ summary: 'Obtener mi perfil de paciente' })
    @ApiOkResponse({ description: 'Perfil de paciente obtenido' })
    @ApiUnauthorizedResponse({ description: 'Token inválido o faltante' })
    @ApiForbiddenResponse({ description: 'Usuario sin patientId' })
    @Get('me')
    async me(@CurrentUser() user: AuthenticatedUser) {
        if (!user.patientId) {
            throw new ForbiddenException('Authenticated user has no patient profile');
        }

        return this.handle(user.patientId, user);
    }

    @ApiOperation({ summary: 'Obtener paciente por id' })
    @ApiParam({ name: 'id', example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    @ApiOkResponse({ description: 'Paciente obtenido' })
    @ApiUnauthorizedResponse({ description: 'Token inválido o faltante' })
    @ApiForbiddenResponse({ description: 'Acceso denegado por ownership/rol' })
    @Get(':id')
    async handle(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const isPatient = user.roles.includes(ROLE_PATIENT);
        if (isPatient && user.patientId !== id) {
            throw new ForbiddenException('You can only access your own patient profile');
        }

        const patient = await this.useCase.execute(id);
        const data = {
            id: patient.id,
            firstName: patient.fullName.firstName,
            lastName: patient.fullName.lastName,
            email: patient.email?.value,
            documentType: patient.document?.type,
            documentNumber: patient.document?.number,
            phone: patient.phone,
            birthDate: patient.birthDate?.toISOString(),
            createdAt: patient.createdAt?.toISOString() ?? '',
        } satisfies PatientResponseDto;

        return { data };
    }
}
