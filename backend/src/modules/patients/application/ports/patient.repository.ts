// Puerto que define el contrato del repositorio de pacientes.
// La implmentación (Prisma) vive en infraestructure/ y nunca aquí.

import { Patient } from "../../domain/entities/patient.entity";
import { PatientDocumentTypeEnum } from "../../domain/enums/patient-document-type.enum";

export interface PatientRepository {
    // Guardar un paciente nuevo
    save(patient: Patient): Promise<void>;

    // Buscar un paciente por su ID
    findById(id: string): Promise<Patient | null>;

    // Verificar existencia sin cargar toda la entidad (más eficiente)
    existsById(id: string): Promise<boolean>;

    // Buscar por número de documento - para validar unicidad.
    findByDocument(
        documentType: PatientDocumentTypeEnum,
        documentNumber: string,
    ): Promise<Patient | null>;

    // Actualizar paciente existente
    update(patient: Patient): Promise<void>;
};
