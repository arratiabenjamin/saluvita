import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateGuardianPermissionsCommand } from "../commands/update-guardian-permissions.command";
import { ActorContext } from "../ports/actor-context";
import type { PatientGuardianRepository } from "../ports/patient-guardian.repository";
import { ROLE_ADMIN } from "../../../../shared/auth/roles.constants";

@Injectable()
export class UpdateGuardianPermissionsUseCase {
    constructor(
        @Inject('PatientGuardianRepository')
        private readonly repository: PatientGuardianRepository,
    ) {}

    async execute(command: UpdateGuardianPermissionsCommand, actor: ActorContext): Promise<{ guardianLinkId: string }> {
        const link = await this.repository.findById(command.guardianLinkId);
        if (!link) throw new NotFoundException('Guardian link not found');

        const isAdmin = actor.roles.includes(ROLE_ADMIN);
        const isPatientOwner = actor.patientId === link.patientId;

        if (!isAdmin && !isPatientOwner) {
            throw new ForbiddenException('Only the patient owner can change guardian permissions');
        }

        const updated = await this.repository.updatePermissions(link.id, {
            canEditProfile: command.canEditProfile,
            canManageAppointments: command.canManageAppointments,
        });

        return { guardianLinkId: updated.id };
    }
}
