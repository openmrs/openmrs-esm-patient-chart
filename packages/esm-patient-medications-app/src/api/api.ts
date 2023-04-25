import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { FetchResponse, openmrsFetch, useConfig, OpenmrsResource } from '@openmrs/esm-framework';
import { OrderPost, PatientMedicationFetchResponse } from '../types/order';
import { ConfigObject } from '../config-schema';
import { useMemo } from 'react';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';

/**
 * Fast, lighweight, reusable data fetcher with built-in cache invalidation that
 * returns a patient's current orders.
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 * @param status The status/the kind of orders to be fetched.
 */
export function usePatientOrders(patientUuid: string, status: 'ACTIVE' | 'any') {
  const { careSettingUuid, drugOrderTypeUUID } = useConfig() as ConfigObject;
  const customRepresentation =
    'custom:(uuid,dosingType,orderNumber,accessionNumber,' +
    'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
    'orderType:ref,encounter:ref,orderer:(uuid,display,person:(display)),orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
    'commentToFulfiller,drug:(uuid,display,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
    'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
    'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)';
  const ordersUrl = `/ws/rest/v1/order?patient=${patientUuid}&careSetting=${careSettingUuid}&status=${status}&orderType=${drugOrderTypeUUID}&v=${customRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<FetchResponse<PatientMedicationFetchResponse>, Error>(
    patientUuid ? ordersUrl : null,
    openmrsFetch,
  );

  const drugOrders = useMemo(
    () =>
      data?.data?.results
        ? data.data.results
            .filter((order) => order.orderType.display === 'Drug Order')
            ?.sort((order1, order2) => (order2.dateActivated > order1.dateActivated ? 1 : -1))
        : null,
    [data],
  );

  return {
    data: data ? drugOrders : null,
    error: error,
    isLoading,
    isValidating,
    mutateOrders: mutate,
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
  drugOrderEncounterType: string,
  currentVisitUuid: string,
  sessionLocationUuid: string,
  abortController?: AbortController,
) {
  const emptyEncounter = {
    patient: patientUuid,
    location: sessionLocationUuid,
    encounterType: drugOrderEncounterType,
    encounterDatetime: new Date().toISOString(),
    visit: currentVisitUuid,
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

export function useSystemVisitSetting() {
  const { data, isLoading, error } = useSWRImmutable<FetchResponse<{ value: 'true' | 'false' }>, Error>(
    `/ws/rest/v1/systemsetting/visits.enabled?v=custom:(value)`,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      systemVisitEnabled: (data?.data?.value ?? 'true').toLowerCase() === 'true',
      errorFetchingSystemVisitSetting: error,
      isLoadingSystemVisitSetting: isLoading,
    }),
    [data, isLoading, error],
  );

  return results;
}

export function useOrderEncounter(patientUuid): {
  activeVisitRequired: boolean;
  isLoading: boolean;
  error: Error;
  encounterUuid: string;
  mutate: Function;
} {
  const { systemVisitEnabled, isLoadingSystemVisitSetting, errorFetchingSystemVisitSetting } = useSystemVisitSetting();

  const [nowDateString] = new Date().toISOString().split('T');
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
