import { apiClient } from '@/shared/lib/axios';
import { PaginatedResponse } from '@/shared/types/api';
import {
  CreatePatientPayload,
  Patient,
  PatientFilters,
} from '@/shared/types/patient';

export const patientsApi = {
  async list(filters: PatientFilters): Promise<PaginatedResponse<Patient>> {
    const { data } = await apiClient.get<PaginatedResponse<Patient>>('/patients', {
      params: filters,
    });
    return data;
  },
  async create(payload: CreatePatientPayload): Promise<Patient> {
    const { data } = await apiClient.post<Patient>('/patients', payload);
    return data;
  },
};
