import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { restBaseUrl } from '@openmrs/esm-framework';

// this is copied directly from a similar hook in the appointments-app in patient management; ideally at some point we could import that hook directly
const appointmentUrlMatcher = `${restBaseUrl}/appointment`;

export function useMutateAppointments() {
  const { mutate } = useSWRConfig();
  // this mutate is intentionally broad because there may be many different keys that need to be invalidated when appointments are updated
  const mutateAppointments = useCallback(
    () =>
      mutate((key) => {
        return (
          (typeof key === 'string' && key.startsWith(appointmentUrlMatcher)) ||
          (Array.isArray(key) && key[0].startsWith(appointmentUrlMatcher))
        );
      }),
    [mutate],
  );

  return {
    mutateAppointments,
  };
}
