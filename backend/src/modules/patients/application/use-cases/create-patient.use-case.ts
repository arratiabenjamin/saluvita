import { Inject, Injectable } from "@nestjs/common";
import type { PatientRepository } from "../ports/patient.repository";
import { CreatePatientCommand } from "../commands/create-patient.command";
import { PatientFullName } from "../../domain/value-objects/patient-full-name.vo";
import { PatientEmail } from "../../domain/value-objects/patient-email.vo";
import { PatientDocumentTypeEnum } from "../../domain/enums/patient-document-type.enum";
import { PatientDocument } from "../../domain/value-objects/patient-document.vo";
import { DuplicatePatientDocumentError } from "../../domain/errors/patient-domain.errors";
import { Patient } from "../../domain/entities/patient.entity";
import { randomUUID } from "crypto";

@Injectable()
export class CreatePatientUseCase {
    constructor(
        // Inyectamos por token de string - el use case no depende de Prisma
        @Inject('PatientRepository')
        private readonly patientRepository : PatientRepository,
    ) {}

    async execute(command: CreatePatientCommand) {
        // 1. Construir calue objects - si alguno falla, lanza error de dominio.
        const fullName = PatientFullName.create(command.firstName, command.lastName);
        const email = command.email ? PatientEmail.create(command.email) : undefined;
        const document = PatientDocument.create(
            command.documentType as PatientDocumentTypeEnum,
            command.documentNumber,
        );

        // 2. Validar unicidad de documento.
        const existingPatient = await this.patientRepository.findByDocument(
            document.type,
            document.number,
        );
        if (existingPatient) throw new DuplicatePatientDocumentError();

        // 3. Crear la entidad - el dominio protege invariantes.
        const patient = Patient.create({
            id: randomUUID(),
            fullName,
            email,
            document,
            phone: command.phone,
            birthDate: command.birthDate,
        })

        // 4. Persistir via puerto
        await this.patientRepository.save(patient);

        return { id: patient.id };
    }
}
