import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type PatientInvoice } from './types';

export function useBills(patientUuid: string) {
  const url = `/ws/rest/v1/cashier/bill?v=full`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    url,
    openmrsFetch,
    {
      errorRetryCount: 2,
    },
  );
  const patientBills = data?.data?.results?.filter((bill) => bill?.patient?.uuid === patientUuid);

  return {
    data: patientBills ? patientBills : [],
    isLoading,
    isError: error,
    isValidating,
  };
}
