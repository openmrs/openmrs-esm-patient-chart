import useSWR from 'swr';
import { FetchResponse, openmrsFetch, useConfig, OpenmrsResource, useSession } from '@openmrs/esm-framework';
import { OrderPost, PatientMedicationFetchResponse } from '../types/order';
import { ConfigObject } from '../config-schema';
import { useMemo } from 'react';

/**
 * Fast, lighweight, reusable data fetcher with built-in cache invalidation that
 * returns a patient's current orders.
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 * @param status The status/the kind of orders to be fetched.
 */
export function usePatientOrders(patientUuid: string, status: 'ACTIVE' | 'any', careSettingUuid: string) {
  const { drugOrderTypeUUID } = useConfig() as ConfigObject;
  const customRepresentation =
    'custom:(uuid,dosingType,orderNumber,accessionNumber,' +
    'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
    'orderType:ref,encounter:ref,orderer:(uuid,display,person:(display)),orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
    'commentToFulfiller,drug:(uuid,display,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
    'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
    'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)';

  const { data, error, isValidating } = useSWR<FetchResponse<PatientMedicationFetchResponse>, Error>(
    `/ws/rest/v1/order?patient=${patientUuid}&careSetting=${careSettingUuid}&status=${status}&orderType=${drugOrderTypeUUID}&v=${customRepresentation}`,
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
    isLoading: !data && !error,
    isValidating,
  };
}

export function useTodayEncounterUuid(patientUuid) {
  const [nowDateString] = new Date().toISOString().split('T');
  const sessionObject = useSession();
  const url = `/ws/rest/v1/encounter?patient=${patientUuid}&fromdate=${nowDateString}&limit=1`;
  const { data, error, mutate, isLoading } = useSWR<FetchResponse<{ results: Array<OpenmrsResource> }>, Error>(
    patientUuid ? url : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      isLoading,
      encounterUuid: data?.data?.results?.[0]?.uuid,
      error,
      mutate,
    }),
    [data, error, mutate, isLoading],
  );

  return results;
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
