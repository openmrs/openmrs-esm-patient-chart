import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { PatientAuditLogResponse } from '../types';

export function usePatientAuditHistory(patientUuid: string, page: number, size: number) {
  const url = patientUuid ? `${restBaseUrl}/auditlogs/patients?uuid=${patientUuid}&page=${page}&size=${size}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: PatientAuditLogResponse }, Error>(
    url,
    openmrsFetch,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  return {
    logs: data?.data?.logs ?? [],
    totalLogs: data?.data?.totalLogs ?? 0,
    totalPages: data?.data?.totalPages ?? 0,
    currentPage: data?.data?.currentPage ?? 0,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
