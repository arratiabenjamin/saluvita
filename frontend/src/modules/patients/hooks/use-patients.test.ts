import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithQuery } from '@/test/utils';
import { usePatients } from './use-patients';
import type { Patient, PatientFilters } from '@/shared/types/patient';
import type { PaginatedResponse } from '@/shared/types/api';

// Mock the entire patients-api module at the module boundary
vi.mock('@/modules/patients/api/patients-api', () => ({
  patientsApi: {
    list: vi.fn(),
    create: vi.fn(),
  },
}));

import { patientsApi } from '@/modules/patients/api/patients-api';

const mockListFn = vi.mocked(patientsApi.list);

const makePatient = (suffix: string): Patient => ({
  id: `patient-${suffix}`,
  firstName: 'Alice',
  lastName: 'Smith',
  document: `DOC-${suffix}`,
  email: `alice-${suffix}@example.com`,
  phone: '+56912345678',
});

const makeMockPage = (page: number): PaginatedResponse<Patient> => ({
  data: [makePatient(`${page}-1`), makePatient(`${page}-2`)],
  meta: {
    total: 20,
    page,
    limit: 10,
    totalPages: 2,
  },
});

const baseFilters: PatientFilters = { search: '', page: 1 };

beforeEach(() => {
  mockListFn.mockReset();
});

describe('usePatients', () => {
  it('returns data and meta matching the mock response for page 1', async () => {
    mockListFn.mockResolvedValueOnce(makeMockPage(1));

    const { result } = renderHookWithQuery(() => usePatients(baseFilters));

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.meta.page).toBe(1);
    expect(result.current.data?.meta.total).toBe(20);
    expect(result.current.meta).toEqual({
      total: 20,
      page: 1,
      limit: 10,
      totalPages: 2,
    });
    expect(mockListFn).toHaveBeenCalledWith(baseFilters);
  });

  it('calls patientsApi.list with updated page when filters.page changes', async () => {
    mockListFn.mockResolvedValue(makeMockPage(1));

    const { result, rerender } = renderHookWithQuery(
      (filters: PatientFilters) => usePatients(filters),
      { initialProps: baseFilters },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockListFn).toHaveBeenCalledWith(baseFilters);

    const page2Filters: PatientFilters = { search: '', page: 2 };
    mockListFn.mockResolvedValue(makeMockPage(2));
    rerender(page2Filters);

    await waitFor(() => {
      expect(mockListFn).toHaveBeenCalledWith(page2Filters);
    });
  });

  it('exposes isLoading as false once data is available', async () => {
    mockListFn.mockResolvedValueOnce(makeMockPage(1));

    const { result } = renderHookWithQuery(() => usePatients(baseFilters));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
