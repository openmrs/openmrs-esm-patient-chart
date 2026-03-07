import { useCallback, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl, useConfig, type FetchResponse } from '@openmrs/esm-framework';
import {
  type DrugOrderBasketItem,
  type DrugOrderPost,
  type PatientOrderFetchResponse,
  type Order,
  type PostDataPrepFunction,
  careSettingUuid,
  type OrderAction,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';

const customRepresentation =
  'custom:(uuid,dosingType,orderNumber,accessionNumber,' +
  'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
  'orderType:ref,encounter:(uuid,display,visit),orderer:(uuid,display,person:(display)),orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
  'commentToFulfiller,fulfillerStatus,drug:(uuid,display,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
  'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
  'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten,concept)';

/**
 * Sorts orders by scheduled in descending order.
 * With a fallback to dateActivated for backward-compatibility
 *
 * @param orders The orders to sort.
 * @returns The sorted orders.
 */
function sortOrdersByScheduledDate(orders: Order[]) {
  return orders?.sort(
    (order1, order2) =>
      new Date(order2.scheduledDate || order2.dateActivated).getTime() -
      new Date(order1.scheduledDate || order1.dateActivated).getTime(),
  );
}

/**
 * SWR-based data fetcher for patient orders.
 *
 * @param patientUuid The UUID of the patient whoose orders should be fetched.
 */
export function usePatientOrders(patientUuid: string) {
  const { drugOrderTypeUUID } = useConfig<ConfigObject>();
  const ordersUrl = useMemo(
    () =>
      patientUuid
        ? `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&orderTypes=${drugOrderTypeUUID}&v=${customRepresentation}&excludeDiscontinueOrders=true`
        : null,
    [patientUuid, drugOrderTypeUUID],
  );

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    ordersUrl,
    openmrsFetch,
  );

  const drugOrders = useMemo(() => sortOrdersByScheduledDate(data?.data?.results) ?? null, [data]);

  const { futureOrders, activeOrders, pastOrders } = useMemo(() => {
    const future: any[] = [];
    const active: any[] = [];
    const past: any[] = [];

    if (!drugOrders) {
      return { futureOrders: future, activeOrders: active, pastOrders: past };
    }

    const time_now = new Date();

    drugOrders.forEach((order) => {
      const dateStopped = order.dateStopped ? new Date(order.dateStopped) : null;
      const autoExpireDate = order.autoExpireDate ? new Date(order.autoExpireDate) : null;
      const dateScheduled = order.scheduledDate ? new Date(order.scheduledDate) : null;

      if (dateScheduled && dateScheduled > time_now && !dateStopped) {
        future.push(order);
      } else if ((autoExpireDate && autoExpireDate <= time_now) || (dateStopped && dateStopped <= time_now)) {
        past.push(order);
      } else {
        active.push(order);
      }
    });

    return { futureOrders: future, activeOrders: active, pastOrders: past };
  }, [drugOrders]);

  return {
    futureOrders,
    activeOrders,
    pastOrders,
    error,
    isLoading,
    isValidating,
  };
}

/**
 * Converts a DrugOrderBasketItem into an Order POST payload
 */
export const prepMedicationOrderPostData: PostDataPrepFunction = (
  order: DrugOrderBasketItem,
  patientUuid,
  encounterUuid,
  orderingProviderUuid,
): DrugOrderPost => {
  if (order.action === 'NEW') {
    return {
      action: 'NEW',
      patient: patientUuid,
      type: 'drugorder',
      careSetting: careSettingUuid,
      orderer: orderingProviderUuid,
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
      scheduledDate: order.scheduledDate,
      urgency: 'ON_SCHEDULED_DATE',
      concept: order.drug.concept.uuid,
      orderReasonNonCoded: order.indication,
    };
  } else if (order.action === 'RENEW') {
    return {
      action: 'NEW',
      previousOrder: order.previousOrder,
      patient: patientUuid,
      type: 'drugorder',
      careSetting: careSettingUuid,
      orderer: orderingProviderUuid,
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
      careSetting: careSettingUuid,
      orderer: orderingProviderUuid,
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
      scheduledDate: order.scheduledDate,
      urgency: 'ON_SCHEDULED_DATE',
      concept: order?.drug?.concept?.uuid,
      orderReasonNonCoded: order.indication,
    };
  } else if (order.action === 'DISCONTINUE') {
    return {
      action: 'DISCONTINUE',
      type: 'drugorder',
      previousOrder: order.previousOrder,
      patient: patientUuid,
      careSetting: careSettingUuid,
      encounter: encounterUuid,
      orderer: orderingProviderUuid,
      concept: order.drug.concept.uuid,
      drug: order.drug.uuid,
      orderReasonNonCoded: null,
    };
  } else {
    throw new Error(`Unknown order action ${order.action}. This is a development error.`);
  }
};

/**
 * The inverse of prepMedicationOrderPostData - converts an Order into a DrugOrderBasketItem
 * See also the same function defined in esm-patient-orders-app/src/utils/index.ts
 */
export function buildMedicationOrder(order: Order, action: OrderAction): DrugOrderBasketItem {
  if (!order.drug) {
    throw new Error('Drug order is missing drug information.');
  }

  return {
    uuid: order.uuid,
    display: order.drug.display,
    previousOrder: action !== 'NEW' ? order.uuid : null,
    action: action,
    drug: order.drug,
    dosage: order.dose ?? null,
    unit: order.doseUnits
      ? {
          value: order.doseUnits.display,
          valueCoded: order.doseUnits.uuid,
        }
      : null,
    frequency: order.frequency
      ? {
          valueCoded: order.frequency.uuid,
          value: order.frequency.display,
        }
      : null,
    route: order.route
      ? {
          valueCoded: order.route.uuid,
          value: order.route.display,
        }
      : null,
    commonMedicationName: order.drug.display,
    isFreeTextDosage: order.dosingType === 'org.openmrs.FreeTextDosingInstructions',
    freeTextDosage: order.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? order.dosingInstructions : '',
    patientInstructions: order.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? order.dosingInstructions : '',
    asNeeded: order.asNeeded,
    asNeededCondition: order.asNeededCondition ?? null,
    scheduledDate: action == 'RENEW' ? new Date() : order.scheduledDate || order.dateActivated,
    duration: order.duration,
    durationUnit: order.durationUnits
      ? {
          valueCoded: order.durationUnits.uuid,
          value: order.durationUnits.display,
        }
      : null,
    pillsDispensed: order.quantity,
    numRefills: order.numRefills,
    indication: order.orderReasonNonCoded,
    quantityUnits: order.quantityUnits
      ? {
          value: order.quantityUnits.display,
          valueCoded: order.quantityUnits.uuid,
        }
      : null,
    encounterUuid: order.encounter?.uuid,
    visit: order.encounter.visit,
  };
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
