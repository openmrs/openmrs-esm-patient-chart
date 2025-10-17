import { restBaseUrl } from '@openmrs/esm-framework';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

/**
 * Returns a function which refreshes the patient orders cache. Uses SWR's mutate function.
 * Refreshes patient orders for all kinds of orders.
 *
 * @param patientUuid The UUID of the patient to get an order mutate function for.
 */
export function useMutatePatientOrders(patientUuid: string) {
  const { mutate } = useSWRConfig();
  const mutateOrders = useCallback(
    () =>
      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${patientUuid}`);
      }),
    [patientUuid, mutate],
  );

  return {
    mutate: mutateOrders,
  };
}
