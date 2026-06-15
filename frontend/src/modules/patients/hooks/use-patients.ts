import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/modules/patients/api/patients-api';
import { CreatePatientPayload, PatientFilters } from '@/shared/types/patient';

export function usePatients(filters: PatientFilters) {
  const query = useQuery({
    queryKey: ['patients', filters],
    queryFn: () => patientsApi.list(filters),
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data,
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
  };
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
