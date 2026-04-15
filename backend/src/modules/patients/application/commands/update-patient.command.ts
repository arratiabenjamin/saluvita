// Separa el mundo del HTTP del mundo de aplicacion.
// El controller transforma el DTO en este command antes de llamar al use case.

export type UpdatePatientCommand = {
    id : string,
    firstName? : string,
    lastName? : string,
    email? : string,
    documentType? : string,
    documentNumber? : string,
    phone? : string,
    birthDate? : Date,
    updatedByUserId : string,
};
