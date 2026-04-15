import {
  PatientFirstNameRequiredError,
  PatientLastNameRequiredError,
} from '../errors/patient-domain.errors';
 
export class PatientFullName {
  private constructor(
    private readonly firstNameValue: string,
    private readonly lastNameValue: string,
  ) {}
 
  static create(firstName: string, lastName: string): PatientFullName {
    // Ambos campos son obligatorios según la regla de negocio
    if (!firstName || firstName.trim().length === 0) {
      throw new PatientFirstNameRequiredError();
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new PatientLastNameRequiredError();
    }
    return new PatientFullName(firstName.trim(), lastName.trim());
  }
 
  get firstName(): string { return this.firstNameValue; }
  get lastName():  string { return this.lastNameValue;  }
  get full():      string { return `${this.firstNameValue} ${this.lastNameValue}`; }
}
