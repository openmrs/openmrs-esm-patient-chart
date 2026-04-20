import { useMemo } from 'react';
import useSWR from 'swr';
import {
  type ConfigObject,
  type FetchResponse,
  openmrsFetch,
  type OpenmrsResource,
  restBaseUrl,
  useConfig,
  useOpenmrsFetchAll,
  type Visit,
} from '@openmrs/esm-framework';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';

export function getPatientEncounterId(patientUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/encounter?patient=${patientUuid}&order=desc&limit=1&v=custom:(uuid)`, {
    signal: abortController.signal,
  });
}

export function getMedicationByUuid(abortController: AbortController, orderUuid: string) {
  return openmrsFetch(
    `${restBaseUrl}/order/${orderUuid}?v=custom:(uuid,route:(uuid,display),action,urgency,display,drug:(display,strength),frequency:(display),dose,doseUnits:(display),orderer,dateStopped,dateActivated,previousOrder,numRefills,duration,durationUnits:(display),dosingInstructions)`,
    {
      signal: abortController.signal,
    },
  );
}

/**
 * If system does not have visit enabled, then fetches the first encounter for the patient on the current date with the configured order encounter type.
 * Else, returns undefined.
 * @returns
 */
export function useOrderEncounterForSystemWithVisitDisabled(patientUuid: string): {
  visitRequired: boolean;
  isLoading: boolean;
  error: Error;
  encounterUuid: string;
  mutate: (...args: unknown[]) => unknown;
} {
  const { systemVisitEnabled, isLoadingSystemVisitSetting, errorFetchingSystemVisitSetting } = useSystemVisitSetting();
  const { orderEncounterType } = useConfig<ConfigObject>();
  const now = new Date();
  const nowDateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const todayEncounter = useSWR<FetchResponse<{ results: Array<OpenmrsResource> }>, Error>(
    !isLoadingSystemVisitSetting && !systemVisitEnabled && patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${orderEncounterType}&fromdate=${nowDateString}&limit=1`
      : null,
    openmrsFetch,
  );

  const results = useMemo(() => {
    return {
      visitRequired: systemVisitEnabled,
      isLoading: isLoadingSystemVisitSetting || todayEncounter.isLoading,
      encounterUuid:
        todayEncounter.data?.data?.results?.length > 0 ? todayEncounter.data.data.results[0].uuid : undefined,

      error: todayEncounter.error || errorFetchingSystemVisitSetting,
      mutate: todayEncounter?.mutate,
    };
  }, [isLoadingSystemVisitSetting, errorFetchingSystemVisitSetting, todayEncounter, systemVisitEnabled]);
  return results;
}

export interface Provider {
  uuid: string;
  person: {
    display?: string;
  };
}

export function useProviders(providerRoles: Array<string>) {
  const rep = 'custom:(uuid,person:(display)';
  const { data, ...rest } = useOpenmrsFetchAll<Provider>(
    providerRoles != null ? `${restBaseUrl}/provider?providerRoles=${providerRoles.join(',')}&v=${rep})` : null,
  );

  const providers = useMemo(() => {
    return data?.sort((a, b) => (a.person?.display ?? '').localeCompare(b.person?.display ?? ''));
  }, [data]);

  return { providers, ...rest };
}
