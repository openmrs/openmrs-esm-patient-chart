import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl, toOmrsIsoString, useConfig, type FetchResponse } from '@openmrs/esm-framework';
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

function orderStartTime(order: Order) {
  return new Date(order.scheduledDate || order.dateActivated).getTime();
}

export function bucketMedicationOrders(drugOrders: Order[] | null | undefined, now = new Date()) {
  const futureOrders: Order[] = [];
  const activeOrders: Order[] = [];
  const pastOrders: Order[] = [];

  if (!drugOrders) {
    return { futureOrders, activeOrders, pastOrders };
  }

  drugOrders.forEach((order) => {
    const dateStopped = order.dateStopped ? new Date(order.dateStopped) : null;
    const autoExpireDate = order.autoExpireDate ? new Date(order.autoExpireDate) : null;
    const dateScheduled = order.scheduledDate ? new Date(order.scheduledDate) : null;

    if (dateScheduled && dateScheduled > now && !dateStopped) {
      futureOrders.push(order);
    } else if ((autoExpireDate && autoExpireDate <= now) || (dateStopped && dateStopped <= now)) {
      pastOrders.push(order);
    } else {
      activeOrders.push(order);
    }
  });

  // Soonest first for upcoming so clinicians see what's next at the top.
  futureOrders.sort((a, b) => orderStartTime(a) - orderStartTime(b));
  // Most recent first for active and past.
  activeOrders.sort((a, b) => orderStartTime(b) - orderStartTime(a));
  pastOrders.sort((a, b) => orderStartTime(b) - orderStartTime(a));

  return { futureOrders, activeOrders, pastOrders };
}

/**
 * SWR-based data fetcher for patient orders.
 *
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 */
export function useMedicationOrders(patientUuid: string) {
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

  const drugOrders = useMemo(() => data?.data?.results ?? null, [data]);

  // Re-evaluate buckets once a minute so an order whose scheduledDate or
  // dateStopped has just crossed "now" moves between buckets without waiting
  // for the next SWR revalidation. `now` is read fresh inside the memo so
  // bucketing triggered by a data refresh also gets a current timestamp.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const { futureOrders, activeOrders, pastOrders } = useMemo(
    () => bucketMedicationOrders(drugOrders, new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drugOrders, tick],
  );

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
  const orderStartDate = order.scheduledDate ? new Date(order.scheduledDate) : null;
  const startDateFragment = orderStartDate
    ? orderStartDate > new Date()
      ? { scheduledDate: toOmrsIsoString(orderStartDate), urgency: 'ON_SCHEDULED_DATE' as const }
      : { dateActivated: toOmrsIsoString(orderStartDate) }
    : {};

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
      concept: order.drug.concept.uuid,
      ...startDateFragment,
      orderReasonNonCoded: order.indication,
    };
  } else if (order.action === 'RENEW') {
    return {
      action: 'RENEW',
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
      ...startDateFragment,
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
      concept: order?.drug?.concept?.uuid,
      ...startDateFragment,
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

function getFutureScheduledDate(order: Order, now = new Date()) {
  const scheduledDate =
    order.urgency === 'ON_SCHEDULED_DATE' && order.scheduledDate ? new Date(order.scheduledDate) : null;
  return scheduledDate && scheduledDate > now ? scheduledDate : null;
}

/**
 * The inverse of prepMedicationOrderPostData - converts an Order into a DrugOrderBasketItem
 * See also the same function defined in esm-patient-orders-app/src/utils/index.ts
 */
export function buildMedicationOrder(order: Order, action: OrderAction): DrugOrderBasketItem {
  if (!order.drug) {
    throw new Error('Drug order is missing drug information.');
  }

  const futureScheduledDate = getFutureScheduledDate(order);

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
          // Not available from the Order resource; auto-calc requires the user to re-select a frequency
          frequencyPerDay: null,
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
    scheduledDate:
      action === 'RENEW' || action === 'REVISE'
        ? futureScheduledDate ?? new Date()
        : new Date(order.scheduledDate || order.dateActivated),
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
    visit: order.encounter?.visit ?? null,
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
