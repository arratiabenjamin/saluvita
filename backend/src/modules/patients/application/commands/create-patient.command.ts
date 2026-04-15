// Separa el mundo del HTTP del mundo de aplicacion.
// El controller transforma el DTO en este command antes de llamar al use case.

export type CreatePatientCommand = {
    firstName : string,
    lastName : string,
    email? : string,
    documentType : string,
    documentNumber : string,
    phone? : string,
    birthDate? : Date,
    createdByUserId : string,
};
