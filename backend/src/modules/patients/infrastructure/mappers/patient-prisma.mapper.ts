import { Patient } from "../../domain/entities/patient.entity";
import { PatientDocumentTypeEnum } from "../../domain/enums/patient-document-type.enum";
import { PatientDocument } from "../../domain/value-objects/patient-document.vo";
import { PatientEmail } from "../../domain/value-objects/patient-email.vo";
import { PatientFullName } from "../../domain/value-objects/patient-full-name.vo";
import type { DocumentType, Patient as PrismaPatient } from "@prisma/client";

// Tipo que refleja la fila de Prisma / PostgreSQL
type PatientPersistence = {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    documentType: DocumentType;
    documentNumber: string;
    phone: string | null;
    birthDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export class PatientPrismaMapper {
    //Dominio -> Persistencia
    static toPersistence(patient: Patient): PatientPersistence{
        return {
            id: patient.id,
            firstName: patient.fullName.firstName,
            lastName: patient.fullName.lastName,
            email: patient.email?.value ?? null,
            documentType: patient.document.type,
            documentNumber: patient.document.number,
            phone: patient.phone ?? null,
            birthDate: patient.birthDate ?? null,
            createdAt: patient.createdAt ?? new Date(),
            updatedAt: new Date(),
            deletedAt: patient.deletedAt ?? null,
        };
    }

    //Persistencia -> Dominio (Rehydrate, no create)
    static toDomain(raw: PrismaPatient): Patient {
        const fullName = PatientFullName.create(raw.firstName, raw.lastName);
        const email = raw.email ? PatientEmail.create(raw.email) : undefined;
        const document = PatientDocument.create(
            raw.documentType as PatientDocumentTypeEnum,
            raw.documentNumber,
        );

        return Patient.rehydrate({
            id: raw.id,
            fullName,
            email,
            document,
            phone: raw.phone ?? undefined,
            birthDate: raw.birthDate ?? undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            deletedAt: raw.deletedAt ?? undefined,
        });

    }
}
