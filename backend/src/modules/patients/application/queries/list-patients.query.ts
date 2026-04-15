// Separa el mundo del HTTP del mundo de aplicacion.
// El controller transforma el DTO en este command antes de llamar al use case.

export type ListPatientsQuery = {
    page : number,
    limit : number,
    patientId? : string,
    search? : string, //Busqueda libre por nombre o documento
};
