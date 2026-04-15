// Enum de tipos de documentos para pacientes.
// Vive en domain/ porque es un concepto de negocio, no de aplicación.

export enum PatientDocumentTypeEnum {
  RUT = 'RUT',
  PASSPORT = 'PASSPORT',
  DNI = 'DNI',
  OTHER = 'OTHER',
}
