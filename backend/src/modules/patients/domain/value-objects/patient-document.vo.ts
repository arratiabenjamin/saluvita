import { PatientDocumentTypeEnum } from "../enums/patient-document-type.enum";
import { InvalidPatientDocumentError } from "../errors/patient-domain.errors";

export class PatientDocument {
    private constructor(
        private readonly typeValue: PatientDocumentTypeEnum,
        private readonly numberValue: string,
    ) {}

    static create(type: PatientDocumentTypeEnum, number: string) : PatientDocument {
        // El numero de documento no puede estar vacio
        if (!number || number.trim().length === 0) {
            throw new InvalidPatientDocumentError();
        }

        return new PatientDocument(type, number.trim().toUpperCase());
    }

    get type() : PatientDocumentTypeEnum { return this.typeValue }
    get number() : string { return this.numberValue }
}