import { ConflictException, Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { CreateDependentCommand } from "../commands/create-dependent.command";
import { ActorContext } from "../ports/actor-context";
import type { PatientGuardianRepository } from "../ports/patient-guardian.repository";
import {
    DependentDocumentAlreadyExistsError,
    EmailAlreadyInUseError,
} from "../../domain/errors/caregiving-domain.errors";

@Injectable()
export class CreateDependentUseCase {
    constructor(
        @Inject('PatientGuardianRepository')
        private readonly repository: PatientGuardianRepository,
    ) {}

    async execute(command: CreateDependentCommand, actor: ActorContext): Promise<{
        userId: string;
        patientId: string;
        guardianLinkId: string;
    }> {
        const passwordHash = await bcrypt.hash(command.password, 10);

        try {
            return await this.repository.createDependent({
                email: command.email.trim().toLowerCase(),
                passwordHash,
                firstName: command.firstName.trim(),
                lastName: command.lastName.trim(),
                documentType: command.documentType,
                documentNumber: command.documentNumber.trim().toUpperCase(),
                birthDate: command.birthDate,
                phone: command.phone?.trim(),
                creatorUserId: actor.userId,
                relationship: command.relationship?.trim() || undefined,
                canEditProfile: command.canEditProfile ?? true,
                canManageAppointments: command.canManageAppointments ?? true,
            });
        } catch (error) {
            if (error instanceof EmailAlreadyInUseError) {
                throw new ConflictException(error.message);
            }
            if (error instanceof DependentDocumentAlreadyExistsError) {
                throw new ConflictException(error.message);
            }
            throw error;
        }
    }
}
