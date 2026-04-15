import { InvalidPatientEmailError } from "../errors/patient-domain.errors";

export class PatientEmail {
    // Contructor privado: solo se puede crear via PatientEmail.create()
    // Esto garantiza que toda instancia ya es valida.
    private constructor(private readonly emailValue: string) {}

    static create(email: string): PatientEmail {
        //Regex estandar para validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new InvalidPatientEmailError();
        }

        //Normalizamos a minusculas para evitar duplicados por capitalizacion
        return new PatientEmail(email.toLowerCase().trim());
    }

    get value(): string {
        return this.emailValue
    }
}