import { apiClient } from '@/shared/lib/axios';
import { ApiListResponse } from '@/shared/types/api';
import {
  CreatePatientPayload,
  Patient,
  PatientFilters,
} from '@/shared/types/patient';

const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Elena',
    lastName: 'Rojas',
    document: '12.345.678-9',
    email: 'elena.rojas@email.com',
    phone: '+56 9 8765 4321',
    relationshipLabel: 'Titular',
    birthDate: '1957-03-15',
  },
  {
    id: '2',
    firstName: 'Martin',
    lastName: 'Soto',
    document: '18.765.432-1',
    email: 'martin.soto@email.com',
    phone: '+56 9 9988 7766',
    relationshipLabel: 'Hijo',
    birthDate: '1987-11-09',
  },
];

function filterPatients(patients: Patient[], filters: PatientFilters) {
  const search = filters.search.trim().toLowerCase();

  if (!search) {
    return patients;
  }

  return patients.filter((patient) =>
    [
      patient.firstName,
      patient.lastName,
      patient.document,
      patient.email,
      patient.relationshipLabel,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search),
  );
}

export const patientsApi = {
  async list(filters: PatientFilters): Promise<ApiListResponse<Patient>> {
    try {
      const { data } = await apiClient.get<ApiListResponse<Patient>>('/patients', {
        params: filters,
      });
      return data;
    } catch {
      const data = filterPatients(mockPatients, filters);
      return { data, total: data.length };
    }
  },
  async create(payload: CreatePatientPayload): Promise<Patient> {
    try {
      const { data } = await apiClient.post<Patient>('/patients', payload);
      return data;
    } catch {
      return {
        id: crypto.randomUUID(),
        ...payload,
      };
    }
  },
};
