import { PatientDocument } from "../value-objects/patient-document.vo"
import { PatientEmail } from "../value-objects/patient-email.vo"
import { PatientFullName } from "../value-objects/patient-full-name.vo"

type CreatePatientProps = {
    id : string,
    fullName : PatientFullName,
    email? : PatientEmail,
    document : PatientDocument,
    phone? : string,
    birthDate? : Date,
}

type RehydratePatientProps = CreatePatientProps & {
    createdAt : Date,
    updatedAt : Date,
    deletedAt? : Date | null,
}

export class Patient {
    private fullNameValue : PatientFullName;
    private emailValue? : PatientEmail;
    private documentValue : PatientDocument;
    private phoneValue? : string;
    private birthDateValue? : Date;

    private constructor(
        public readonly id : string,
        fullName:  PatientFullName,
        document: PatientDocument,
        email?:    PatientEmail,
        phone?:    string,
        birthDate?: Date,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date,
        public readonly deletedAt?: Date | null,
    ) {
        this.fullNameValue  = fullName;
        this.emailValue     = email;
        this.documentValue  = document;
        this.phoneValue     = phone;
        this.birthDateValue = birthDate;
    }

    // Crear un Paciente nuevo - Valida las invariantes obligatorias.
    static create(props : CreatePatientProps) : Patient {
        if (!props.id) throw new Error('Patient id is required');
        if (!props.document) throw new Error('Patient document is required');

        return new Patient(
            props.id,
            props.fullName,
            props.document,
            props.email,
            props.phone,
            props.birthDate,
        );
    }

    // Recontruir desde persistencia - No pasa por validaciones de creación.
    static rehydrate(props: RehydratePatientProps) : Patient {
        return new Patient(
            props.id,
            props.fullName,
            props.document,
            props.email,
            props.phone,
            props.birthDate,
            props.createdAt,
            props.updatedAt,
            props.deletedAt,
        );
    }

    //Actualizar info - Método de negocio, no setter suelto.
    updateInfo(props : {
        fullName? : PatientFullName,
        email? : PatientEmail,
        document? : PatientDocument,
        phone? : string,
        birthDate? : Date,
    }) : void {
        if (props.fullName !== undefined) this.fullNameValue = props.fullName;
        if (props.email !== undefined) this.emailValue = props.email;
        if (props.document !== undefined) this.documentValue = props.document;
        if (props.phone !== undefined) this.phoneValue = props.phone;
        if (props.birthDate !== undefined) this.birthDateValue = props.birthDate;
    }

    get fullName() : PatientFullName { return this.fullNameValue }
    get email() : PatientEmail | undefined { return this.emailValue }
    get document() : PatientDocument { return this.documentValue }
    get phone() : string | undefined { return this.phoneValue }
    get birthDate() : Date | undefined { return this.birthDateValue }
}
