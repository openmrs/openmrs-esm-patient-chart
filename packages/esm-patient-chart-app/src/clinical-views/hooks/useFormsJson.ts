import useSWR from 'swr';

import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Form } from '../types';

export function useFormsJson(formUuid: string) {
  const url = `${restBaseUrl}/form/${formUuid}`;
  const { data, isLoading, error } = useSWR<{ data: Form }, Error>(url, openmrsFetch);

  return {
    formsJson: data?.data ?? null,
    isLoading,
    error,
  };
}
