import { useQuery } from '@tanstack/react-query';
import { getProfessionals } from '@/modules/professionals/api/professionals-api';

type UseProfessionalsParams = {
  patientId?: string;
};

export function useProfessionals(params: UseProfessionalsParams = {}) {
  return useQuery({
    queryKey: ['professionals', params],
    queryFn: () => getProfessionals(params),
  });
}
