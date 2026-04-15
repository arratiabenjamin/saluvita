import { Controller, ForbiddenException, Get, Query, UseGuards } from "@nestjs/common";
import { ListPatientsQueryDto } from "../dto/list-patients.dto";
import { ListPatientsUseCase } from "../../application/use-cases/list-patients.use-case";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@Controller('/v1/patients')
export class ListPatientsController {
    constructor(private readonly useCase: ListPatientsUseCase) {}

    @Get()
    async handle(
        @Query() query: ListPatientsQueryDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const isPatient = user.roles.includes(ROLE_PATIENT);
        if (isPatient && !user.patientId) {
            throw new ForbiddenException('Authenticated user has no patient profile');
        }
        return this.useCase.execute({
            page: query.page,
            limit: query.limit,
            patientId: isPatient ? user.patientId : undefined,
            search: query.search,
        });
    }
}
