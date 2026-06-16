export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  email: string;
  phone: string;
  relationshipLabel?: string;
  birthDate?: string;
};

export type PatientFilters = {
  search: string;
  page: number;
};

export type CreatePatientPayload = {
  firstName: string;
  lastName: string;
  document: string;
  email: string;
  phone: string;
  relationshipLabel?: string;
  birthDate?: string;
};
