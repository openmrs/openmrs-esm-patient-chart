import { useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl, useConfig, type FetchResponse } from '@openmrs/esm-framework';
import { type OrderPost, type PatientOrderFetchResponse } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import { type DrugOrderBasketItem } from '../types';

export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';

const customRepresentation =
  'custom:(uuid,dosingType,orderNumber,accessionNumber,' +
  'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
  'orderType:ref,encounter:ref,orderer:(uuid,display,person:(display)),orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
  'commentToFulfiller,drug:(uuid,display,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
  'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
  'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)';

/**
 * Sorts orders by date activated in descending order.
 *
 * @param orders The orders to sort.
 * @returns The sorted orders.
 */
function sortOrdersByDateActivated(orders: any[]) {
  return orders?.sort(
    (order1, order2) => new Date(order2.dateActivated).getTime() - new Date(order1.dateActivated).getTime(),
  );
}

/**
 * SWR-based data fetcher for patient orders.
 *
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 */
export function usePatientOrders(patientUuid: string) {
  const { drugOrderTypeUUID } = useConfig<ConfigObject>();

  const ordersUrl = `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&orderTypes=${drugOrderTypeUUID}&v=${customRepresentation}&excludeDiscontinueOrders=true`;

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    patientUuid ? ordersUrl : null,
    openmrsFetch,
  );

  const mutateOrders = useCallback(
    () => mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${patientUuid}`)),
    [patientUuid],
  );

  const drugOrders = useMemo(() => sortOrdersByDateActivated(data?.data?.results) ?? null, [data]);

  return {
    data: data ? drugOrders : null,
    error,
    isLoading,
    isValidating,
    mutate: mutateOrders,
  };
}

/**
 * Hook to get active patient orders.
 *
 * @param patientUuid The UUID of the patient whose active orders should be fetched.
 */
export function useActivePatientOrders(patientUuid: string) {
  const { drugOrderTypeUUID } = useConfig<ConfigObject>();
  const ordersUrl = useMemo(
    () =>
      patientUuid
        ? `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&orderTypes=${drugOrderTypeUUID}&excludeCanceledAndExpired=true&v=${customRepresentation}`
        : null,
    [patientUuid, drugOrderTypeUUID],
  );
  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    ordersUrl,
    openmrsFetch,
  );

  const activeOrders = useMemo(() => sortOrdersByDateActivated(data?.data?.results) ?? null, [data]);

  return {
    data: activeOrders,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

/**
 * Hook to get past patient orders.
 *
 * @param patientUuid The UUID of the patient whose past orders should be fetched.
 */
export function usePastPatientOrders(patientUuid: string) {
  const { data: allOrders, error, isLoading, isValidating, mutate } = usePatientOrders(patientUuid);
  const { data: activeOrders } = useActivePatientOrders(patientUuid);

  const pastOrders = useMemo(() => {
    if (!allOrders || !activeOrders) {
      return [];
    }

    const filteredDrugOrders = allOrders.filter(
      (order) => !activeOrders.some((activeOrder) => activeOrder.uuid === order.uuid),
    );
    return sortOrdersByDateActivated(filteredDrugOrders);
  }, [allOrders, activeOrders]);

  return {
    data: pastOrders,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export function prepMedicationOrderPostData(
  order: DrugOrderBasketItem,
  patientUuid: string,
  encounterUuid: string | null,
): OrderPost {
  if (order.action === 'NEW' || order.action === 'RENEW') {
    return {
      action: 'NEW',
      patient: patientUuid,
      type: 'drugorder',
      careSetting: order.careSetting,
      orderer: order.orderer,
      encounter: encounterUuid,
      drug: order.drug.uuid,
      dose: order.dosage,
      doseUnits: order.unit?.valueCoded,
      route: order.route?.valueCoded,
      frequency: order.frequency?.valueCoded,
      asNeeded: order.asNeeded,
      asNeededCondition: order.asNeededCondition,
      numRefills: order.numRefills,
      quantity: order.pillsDispensed,
      quantityUnits: order.quantityUnits?.valueCoded,
      duration: order.duration,
      durationUnits: order.durationUnit?.valueCoded,
      dosingType: order.isFreeTextDosage
        ? 'org.openmrs.FreeTextDosingInstructions'
        : 'org.openmrs.SimpleDosingInstructions',
      dosingInstructions: order.isFreeTextDosage ? order.freeTextDosage : order.patientInstructions,
      concept: order.drug.concept.uuid,
      orderReasonNonCoded: order.indication,
    };
  } else if (order.action === 'REVISE') {
    return {
      action: 'REVISE',
      patient: patientUuid,
      type: 'drugorder',
      previousOrder: order.previousOrder,
      careSetting: order.careSetting,
      orderer: order.orderer,
      encounter: encounterUuid,
      drug: order.drug.uuid,
      dose: order.dosage,
      doseUnits: order.unit?.valueCoded,
      route: order.route?.valueCoded,
      frequency: order.frequency?.valueCoded,
      asNeeded: order.asNeeded,
      asNeededCondition: order.asNeededCondition,
      numRefills: order.numRefills,
      quantity: order.pillsDispensed,
      quantityUnits: order.quantityUnits?.valueCoded,
      duration: order.duration,
      durationUnits: order.durationUnit?.valueCoded,
      dosingType: order.isFreeTextDosage
        ? 'org.openmrs.FreeTextDosingInstructions'
        : 'org.openmrs.SimpleDosingInstructions',
      dosingInstructions: order.isFreeTextDosage ? order.freeTextDosage : order.patientInstructions,
      concept: order?.drug?.concept?.uuid,
      orderReasonNonCoded: order.indication,
    };
  } else if (order.action === 'DISCONTINUE') {
    return {
      action: 'DISCONTINUE',
      type: 'drugorder',
      previousOrder: order.previousOrder,
      patient: patientUuid,
      careSetting: order.careSetting,
      encounter: encounterUuid,
      orderer: order.orderer,
      concept: order.drug.concept.uuid,
      drug: order.drug.uuid,
      orderReasonNonCoded: null,
    };
  } else {
    throw new Error(`Unknown order action ${order.action}. This is a development error.`);
  }
}

/**
 * Hook to fetch the system setting for whether to require quantity, quantity units,
 * and number of refills for outpatient drug orders.
 *
 * @returns An object containing:
 * - requireOutpatientQuantity: A boolean indicating whether to require quantity, quantity units,
 * and number of refills for outpatient drug orders.
 * - error: Any error encountered during the fetch operation.
 * - isLoading: A boolean indicating if the fetch operation is in progress.
 */
export function useRequireOutpatientQuantity(): {
  requireOutpatientQuantity: boolean;
  isLoading: boolean;
  error?: Error;
} {
  const url = `${restBaseUrl}/systemsetting/drugOrder.requireOutpatientQuantity?v=custom:(value)`;

  const { data, error, isLoading } = useSWRImmutable<{ data: { value: 'true' | 'false' } }, Error>(url, openmrsFetch);

  const results = useMemo(
    () => ({
      requireOutpatientQuantity: data?.data?.value && data.data.value === 'true',
      error,
      isLoading,
    }),
    [data?.data?.value, error, isLoading],
  );

  return results;
}
