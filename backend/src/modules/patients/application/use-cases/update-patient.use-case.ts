import { Inject, Injectable } from "@nestjs/common";
import type { PatientRepository } from "../ports/patient.repository";
import { UpdatePatientCommand } from "../commands/update-patient.command";
import { PatientNotFoundError } from "../../domain/errors/patient-domain.errors";
import { PatientFullName } from "../../domain/value-objects/patient-full-name.vo";
import { PatientEmail } from "../../domain/value-objects/patient-email.vo";
import { PatientDocument } from "../../domain/value-objects/patient-document.vo";
import { PatientDocumentTypeEnum } from "../../domain/enums/patient-document-type.enum";

@Injectable()
export class UpdatePatientUseCase {
    constructor(
        @Inject("PatientRepository")
        private readonly patientRepository: PatientRepository
    ) {}

    async execute(command: UpdatePatientCommand) {
        const patient = await this.patientRepository.findById(command.id);

        if (!patient) throw new PatientNotFoundError(command.id);

        const fullName = command.firstName && command.lastName ? PatientFullName.create(command.firstName, command.lastName) : patient.fullName;
        const email = command.email ? PatientEmail.create(command.email) : undefined;
        const document = command.documentType && command.documentNumber ? PatientDocument.create(command.documentType as PatientDocumentTypeEnum, command.documentNumber) : undefined;
        
        // El método updateInfo() de la entidad aplica solo los cambios recibidos.
        patient.updateInfo({
            fullName,
            email,
            document,
            phone: command.phone,
            birthDate: command.birthDate,
        });

        await this.patientRepository.update(patient);
        return { id: patient.id };
    }
}
