// Cada error representa una violacion de una regla de negocio especifica.
// NO son errores HTTP. El exception filter global los convertira a 400/404/etc.

export class PatientFirstNameRequiredError extends Error {
    constructor() {
        super('Patient first name is required');
        this.name = 'PatientFirstNameRequiredError';
    }
}

export class PatientLastNameRequiredError extends Error {
    constructor() {
        super('Patient last name is required');
        this.name = 'PatientLastNameRequiredError';
    }
}

export class InvalidPatientEmailError extends Error {
    constructor() {
        super('The provided email address is invalid.');
        this.name = 'InvalidPatientEmailError';
    }
}

export class InvalidPatientDocumentError extends Error {
    constructor() {
        super('The provided document number is invalid.');
        this.name = 'InvalidPatientDocumentError';
    }
}

export class PatientNotFoundError extends Error {
  constructor(id: string) {
    super(`Patient with id '${id}' was not found.`);
    this.name = 'PatientNotFoundError';
  }
}
 
export class DuplicatePatientDocumentError extends Error {
  constructor() {
    super('A patient with this document already exists in the organization.');
    this.name = 'DuplicatePatientDocumentError';
  }
}
