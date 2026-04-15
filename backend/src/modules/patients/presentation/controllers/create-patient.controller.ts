import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreatePatientUseCase } from "../../application/use-cases/create-patient.use-case";
import { CreatePatientDto } from "../dto/create-patient.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER)
@Controller('/v1/patients')
export class CreatePatientController {
    constructor(private readonly useCase: CreatePatientUseCase) {}

    @Post()
    async handle(
        @Body() dto: CreatePatientDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        //El controller transforma el DTO en un command - Separa HTTP de aplicación
        const created = await this.useCase.execute({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            phone: dto.phone,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            createdByUserId: user.userId,
        });

        return { data: created };
    }
}
