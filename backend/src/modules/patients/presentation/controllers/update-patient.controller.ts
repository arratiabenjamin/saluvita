import { Body, Controller, ForbiddenException, Param, Patch, UseGuards } from "@nestjs/common";
import { UpdatePatientUseCase } from "../../application/use-cases/update-patient.use-case";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@Controller('/v1/patients')
export class UpdatePatientController {
    constructor(private readonly useCase: UpdatePatientUseCase) {}

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
