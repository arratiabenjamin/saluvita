import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/modules/patients/api/patients-api';
import { CreatePatientPayload, PatientFilters } from '@/shared/types/patient';

export function usePatients(filters: PatientFilters) {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => patientsApi.list(filters),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePatientPayload) => patientsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
