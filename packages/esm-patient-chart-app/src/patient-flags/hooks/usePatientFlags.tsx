import { openmrsFetch } from '@openmrs/esm-framework';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

interface FlagFetchResponse {
  uuid: string;
  name: string;
  message: string;
}

interface FlagsFetchResponse {
  results: Array<FlagFetchResponse>;
}

/**
 * React hook that takes in a patient uuid and returns
 * patient flags for that patient together with helper objects
 * @param patientUuid Unique patient idenfier
 * @returns An array of patient identifiers
 */
export function useFlagsFromPatient(patientUuid: string) {
  const { data, error, isValidating, mutate } = useSWR<{ data: FlagsFetchResponse }, Error>(
    `/ws/rest/v1/patientflags/flag?patient=${patientUuid}&v=full`,
    openmrsFetch,
  );
  const result = useMemo(() => {
    return {
      flags: data?.data?.results ?? null,
      flagLoadingError: error,
      isLoadingFlags: !data && !error,
      isValidatingFlags: isValidating,
      mutate,
    };
  }, [data, error, isValidating, mutate]);
  return result;
}

export function useCurrentPath(): string {
  const [path, setPath] = useState(window.location.pathname);

  const listenToRoutingEvent = useCallback(() => {
    const winPath = window.location.pathname;
    setPath(winPath);
  }, []);

  useEffect(() => {
    const handleRoutingEvent = () => {
      listenToRoutingEvent();
    };

    window.addEventListener('single-spa:routing-event', handleRoutingEvent);

    return () => {
      window.removeEventListener('single-spa:routing-event', handleRoutingEvent);
    };
  }, [listenToRoutingEvent]);

  return path;
}
