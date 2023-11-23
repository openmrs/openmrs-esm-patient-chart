import { useCallback, useMemo } from 'react';
import useSWR, { mutate, useSWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, type OpenmrsResource, parseDate, type Visit } from '@openmrs/esm-framework';
import {
  type OrderPost,
  useVisitOrOfflineVisit,
  useSystemVisitSetting,
  type PatientOrderFetchResponse,
} from '@openmrs/esm-patient-common-lib';

export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';

/**
 * Returns a function which refreshes the patient orders cache. Uses SWR's mutate function.
 * Refreshes patient orders for all kinds of orders.
 *
 * TODO: This isn't working. See https://github.com/vercel/swr/issues/2746
 *
 * @param patientUuid The UUID of the patient to get an order mutate function for.
 */
export function useMutatePatientOrders(patientUuid: string) {
  const { mutate } = useSWRConfig();
  const mutateOrders = useCallback(
    () =>
      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`/ws/rest/v1/order?patient=${patientUuid}`);
      }),
    [patientUuid, mutate],
  );

  return {
    mutate: mutateOrders,
  };
}

export function getPatientEncounterId(patientUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/encounter?patient=${patientUuid}&order=desc&limit=1&v=custom:(uuid)`, {
    signal: abortController.signal,
  });
}

export function getMedicationByUuid(abortController: AbortController, orderUuid: string) {
  return openmrsFetch(
    `/ws/rest/v1/order/${orderUuid}?v=custom:(uuid,route:(uuid,display),action,urgency,display,drug:(display,strength),frequency:(display),dose,doseUnits:(display),orderer,dateStopped,dateActivated,previousOrder,numRefills,duration,durationUnits:(display),dosingInstructions)`,
    {
      signal: abortController.signal,
    },
  );
}

export function createEmptyEncounter(
  patientUuid: string,
  orderEncounterType: string,
  activeVisit: Visit | null,
  sessionLocationUuid: string,
  abortController?: AbortController,
) {
  const now = new Date();
  const visitStartDate = parseDate(activeVisit?.startDatetime);
  const visitEndDate = parseDate(activeVisit?.stopDatetime);
  let encounterDate: Date;
  if (!activeVisit || (visitStartDate < now && (!visitEndDate || visitEndDate > now))) {
    now;
  } else {
    console.warn(
      'createEmptyEncounter received an active visit that is not currently active. This is a programming error. Attempting to place the order using the visit start date.',
    );
    visitStartDate;
  }
  const emptyEncounter = {
    patient: patientUuid,
    location: sessionLocationUuid,
    encounterType: orderEncounterType,
    encounterDatetime: encounterDate,
    visit: activeVisit?.uuid,
    obs: [],
  };

  return openmrsFetch<OpenmrsResource>('/ws/rest/v1/encounter', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: emptyEncounter,
    signal: abortController?.signal,
  }).then((res) => res?.data?.uuid);
}

export function postOrder(body: OrderPost, abortController?: AbortController) {
  return openmrsFetch(`/ws/rest/v1/order`, {
    method: 'POST',
    signal: abortController?.signal,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

export function useOrderEncounter(patientUuid: string): {
  activeVisitRequired: boolean;
  isLoading: boolean;
  error: Error;
  encounterUuid: string;
  mutate: Function;
} {
  const { systemVisitEnabled, isLoadingSystemVisitSetting, errorFetchingSystemVisitSetting } = useSystemVisitSetting();

  const now = new Date();
  const nowDateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const todayEncounter = useSWR<FetchResponse<{ results: Array<OpenmrsResource> }>, Error>(
    !isLoadingSystemVisitSetting && !systemVisitEnabled && patientUuid
      ? `/ws/rest/v1/encounter?patient=${patientUuid}&fromdate=${nowDateString}&limit=1`
      : null,
    openmrsFetch,
  );
  const visit = useVisitOrOfflineVisit(patientUuid);

  const results = useMemo(() => {
    if (isLoadingSystemVisitSetting || errorFetchingSystemVisitSetting) {
      return {
        activeVisitRequired: false,
        isLoading: isLoadingSystemVisitSetting,
        error: errorFetchingSystemVisitSetting,
        encounterUuid: null,
        mutate: () => {},
      };
    }
    return systemVisitEnabled
      ? {
          activeVisitRequired: true,
          isLoading: visit?.isLoading,
          encounterUuid: visit?.currentVisit?.encounters?.[0]?.uuid,
          error: visit?.error,
          mutate: visit?.mutate,
        }
      : {
          activeVisitRequired: false,
          isLoading: todayEncounter?.isLoading,
          encounterUuid: todayEncounter?.data?.data?.results?.[0]?.uuid,
          error: todayEncounter?.error,
          mutate: todayEncounter?.mutate,
        };
  }, [isLoadingSystemVisitSetting, errorFetchingSystemVisitSetting, visit, todayEncounter, systemVisitEnabled]);
  return results;
}

export function useOrderTypes() {
  const orderTypesUrl = `/ws/rest/v1/ordertype`;
  const { data, error, isLoading, isValidating } = useSWR<FetchResponse, Error>(orderTypesUrl, openmrsFetch);

  return {
    data: data?.data?.results,
    error,
    isLoading,
    isValidating,
  };
}

export function usePatientOrders(patientUuid: string, status: 'ACTIVE' | 'any', orderType?: string) {
  const baseOrdersUrl = `/ws/rest/v1/order?v=full&patient=${patientUuid}&careSetting=${careSettingUuid}&status=${status}`;
  const ordersUrl = orderType ? `${baseOrdersUrl}&orderType=${orderType}` : baseOrdersUrl;

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    patientUuid ? ordersUrl : null,
    openmrsFetch,
  );

  const mutateOrders = useCallback(
    () => mutate((key) => typeof key === 'string' && key.startsWith(`/ws/rest/v1/order?patient=${patientUuid}`)),
    [patientUuid],
  );

  const orders = useMemo(
    () =>
      data?.data?.results
        ? data.data.results?.sort((order1, order2) => (order2.dateActivated > order1.dateActivated ? 1 : -1))
        : null,
    [data],
  );

  return {
    data: data ? orders : null,
    error,
    isLoading,
    isValidating,
    mutate: mutateOrders,
  };
}
