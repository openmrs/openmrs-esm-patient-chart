import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';

export interface FlagFetchResponse {
  uuid: string;
  message: string;
  voided: boolean;
  flag: { uuid: string; display: string };
  patient: { uuid: string; display: string };
  tags: Array<{ uuid: string; display: string }>;
  auditInfo: { dateCreated: string };
}

export interface FlagDefinition {
  uuid: string;
  display: string;
  priority: { uuid: string; name: string };
  tags: Array<{ uuid: string; display: string }>;
}

export interface FlagsFetchResponse {
  results: Array<FlagFetchResponse>;
}

export interface FlagDefinitionsFetchResponse {
  results: Array<FlagDefinition>;
}

export interface FlagWithPriority extends FlagFetchResponse {
  flagDefinition: FlagDefinition;
}

/**
 * React hook that takes in a patient uuid and returns
 * patient flags for that patient together with helper objects
 * @param patientUuid Unique patient identifier
 * @returns An array of patient identifiers with priority information
 */
export function usePatientFlags(patientUuid: string) {
  const patientFlagsUrl = `${restBaseUrl}/patientflags/patientflag?patient=${patientUuid}&v=full`;

  const {
    data: patientFlagsData,
    error: patientFlagsError,
    isLoading: isLoadingPatientFlags,
  } = useSWR<FetchResponse<FlagsFetchResponse>, Error>(patientUuid ? patientFlagsUrl : null, openmrsFetch);

  const patientFlags = patientFlagsData?.data?.results ?? [];
  const flagUuids = patientFlags.map((pf) => pf.flag.uuid);

  const flagDefinitionsUrl = flagUuids.length > 0 ? `${restBaseUrl}/patientflags/flag?v=full` : null;

  const {
    data: flagDefinitionsData,
    error: flagDefinitionsError,
    isLoading: isLoadingFlagDefinitions,
  } = useSWR<FetchResponse<FlagDefinitionsFetchResponse>, Error>(flagDefinitionsUrl, openmrsFetch);

  const flagDefinitions = flagDefinitionsData?.data?.results ?? [];

  // Merge patient flags with flag definitions to get priority information
  const flagsWithPriority: FlagWithPriority[] = patientFlags.map((pf) => ({
    ...pf,
    flagDefinition: flagDefinitions.find((f) => f.uuid === pf.flag.uuid),
  }));

  const result = {
    flags: flagsWithPriority,
    error: patientFlagsError || flagDefinitionsError,
    isLoading: isLoadingPatientFlags || isLoadingFlagDefinitions,
    isValidating: false,
    mutate: () => {},
  };

  return result;
}

export function useCurrentPath(): string {
  const [path, setPath] = useState(window.location.pathname);

  const listenToRoutingEvent = useCallback(
    (e) => {
      const winPath = e.detail.newUrl;
      setPath(winPath);
    },
    [setPath],
  );

  useEffect(() => {
    window.addEventListener('single-spa:routing-event', listenToRoutingEvent);
    return () => {
      window.removeEventListener('single-spa:routing-event', listenToRoutingEvent);
    };
  }, [listenToRoutingEvent]);

  return path;
}

export function enablePatientFlag(flagUuid: string) {
  const controller = new AbortController();
  const url = `${restBaseUrl}/patientflags/patientflag/${flagUuid}`;

  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: { voided: false },
    signal: controller.signal,
  });
}

export function disablePatientFlag(flagUuid: string) {
  const controller = new AbortController();
  const url = `${restBaseUrl}/patientflags/patientflag/${flagUuid}`;

  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
    signal: controller.signal,
  });
}
