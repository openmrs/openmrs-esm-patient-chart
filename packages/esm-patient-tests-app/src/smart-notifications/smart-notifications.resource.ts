import { useMemo } from 'react';
import useSWR from 'swr';
import {
  type FetchResponse,
  fhirBaseUrl,
  openmrsFetch,
  restBaseUrl,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import {
  careSettingUuid,
  type Order,
  type PatientOrderFetchResponse,
  type ReferenceRanges,
  useReferenceRanges,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import { type FHIRObservationResource } from '../types';
import {
  extractObservationInterpretation,
  extractObservationReferenceRanges,
} from '../test-results/loadPatientTestData/helpers';
import {
  type ResultedObservation,
  type SmartNotification,
  sortNotifications,
  toNotification,
} from './notification-model';
import { useOptIns } from './opt-in-store';
import { useReadNotifications } from './read-store';
import { optInKey } from './constants';
import { useReviewedNotifications } from './review-store';

interface FHIRObservationBundle {
  entry?: Array<{ resource: FHIRObservationResource }>;
}

/** Strips the resource type from a FHIR reference, e.g. "Encounter/abc-123" -> "abc-123". */
function referenceId(reference: string | undefined): string | undefined {
  return reference?.split('/')[1];
}

function observationValue(resource: FHIRObservationResource): { value?: string; units?: string } {
  if (resource.valueQuantity) {
    return { value: String(resource.valueQuantity.value), units: resource.valueQuantity.unit };
  }
  if (resource.valueCodeableConcept) {
    return { value: resource.valueCodeableConcept.coding?.[0]?.display ?? resource.valueCodeableConcept.text };
  }
  if (resource.valueString) {
    return { value: resource.valueString };
  }
  return {};
}

export function toResultedObservation(
  resource: FHIRObservationResource,
  conceptRanges?: ReferenceRanges,
): ResultedObservation {
  const { value, units } = observationValue(resource);
  // Observation-level ranges (what the lab actually reported against) win over the dictionary's.
  const ranges = extractObservationReferenceRanges(resource) ?? conceptRanges;

  return {
    uuid: resource.id,
    conceptUuid: resource.code?.coding?.[0]?.code,
    display: resource.code?.text ?? resource.code?.coding?.[0]?.display,
    value,
    units: units ?? ranges?.units,
    interpretation: extractObservationInterpretation(resource),
    ranges,
    effectiveDateTime: resource.effectiveDateTime ?? resource.issued,
  };
}

/**
 * Pairs each order with the result it produced.
 *
 * FHIR lab observations carry no `basedOn` pointing back at the order, so the join is heuristic.
 * Two rules keep it honest, because a wrong pairing means a notification for an order that was
 * never resulted:
 *
 * 1. A result must plausibly belong to the order — either recorded in the same encounter, or
 *    timestamped at/after the order was placed. Without this, a fresh order inherits an old result
 *    for the same concept and notifies straight away, before the lab has done anything.
 * 2. A result is claimed by at most one order, newest order first, so re-ordering the same test
 *    doesn't make one result light up every past order for that concept.
 *
 * Orders with no result yet are returned unpaired, which is what makes a pending order silent.
 */
export function joinObservationsToOrders(
  orders: Array<Order>,
  observations: Array<ResultedObservation & { encounterUuid?: string }>,
): Array<{ order: Order; obs: ResultedObservation | undefined }> {
  const byConcept = new Map<string, Array<ResultedObservation & { encounterUuid?: string }>>();
  for (const obs of observations) {
    if (!obs.conceptUuid) {
      continue;
    }
    const bucket = byConcept.get(obs.conceptUuid) ?? [];
    bucket.push(obs);
    byConcept.set(obs.conceptUuid, bucket);
  }

  const claimed = new Set<string>();

  // Newest order first, so the most recent order gets first claim on the most recent result.
  const newestFirst = [...orders].sort((a, b) => (b.dateActivated ?? '').localeCompare(a.dateActivated ?? ''));

  const matches = new Map<string, ResultedObservation | undefined>();

  for (const order of newestFirst) {
    const candidates = (byConcept.get(order.concept?.uuid) ?? []).filter((obs) => !claimed.has(obs.uuid));

    const sameEncounter = candidates.filter(
      (obs) => obs.encounterUuid && order.encounter?.uuid && obs.encounterUuid === order.encounter.uuid,
    );

    // A result cannot predate the order that asked for it.
    const afterOrder = candidates.filter(
      (obs) => obs.effectiveDateTime && order.dateActivated && obs.effectiveDateTime >= order.dateActivated,
    );

    const pool = sameEncounter.length ? sameEncounter : afterOrder;
    const obs = [...pool].sort((a, b) => (a.effectiveDateTime ?? '').localeCompare(b.effectiveDateTime ?? ''))[0];

    if (obs) {
      claimed.add(obs.uuid);
    }
    matches.set(order.uuid, obs);
  }

  return orders.map((order) => ({ order, obs: matches.get(order.uuid) }));
}

/**
 * Derives the notifications that need a clinician's attention for the open chart.
 *
 * Everything is computed client-side from the order REST resource and FHIR observations; there is
 * no notification backend. Polls on `smartNotifications.pollingIntervalMs`.
 */
export function useSmartNotifications(patientUuid: string) {
  const config = useConfig<ConfigObject>();
  const { enabled, locationScoped, notifyOnAbnormalNonCritical, pollingIntervalMs } = config.smartNotifications;
  const { labOrderTypeUuid } = config.orders;
  const session = useSession();
  const reviewed = useReviewedNotifications();
  const read = useReadNotifications();
  const optIns = useOptIns();

  const shouldFetch = Boolean(enabled && patientUuid);

  const ordersUrl = shouldFetch
    ? `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&status=any&orderType=${labOrderTypeUuid}&v=full`
    : null;
  const observationsUrl = shouldFetch
    ? `${fhirBaseUrl}/Observation?patient=${patientUuid}&category=laboratory&_sort=-_date&_count=100`
    : null;

  const {
    data: ordersResponse,
    error: ordersError,
    isLoading: isLoadingOrders,
    mutate: mutateOrders,
  } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(ordersUrl, openmrsFetch, {
    refreshInterval: pollingIntervalMs,
  });

  const {
    data: observationsResponse,
    error: observationsError,
    isLoading: isLoadingObservations,
    mutate: mutateObservations,
  } = useSWR<FetchResponse<FHIRObservationBundle>, Error>(observationsUrl, openmrsFetch, {
    refreshInterval: pollingIntervalMs,
  });

  const orders = useMemo(() => ordersResponse?.data?.results ?? [], [ordersResponse]);

  const conceptUuids = useMemo(
    () => Array.from(new Set(orders.map((order) => order.concept?.uuid).filter(Boolean))),
    [orders],
  );

  // Critical-tier accuracy depends on the dictionary populating critical ranges; this is the same
  // endpoint the results viewer uses, so the two agree on what "critical" means.
  const { ranges: conceptRanges } = useReferenceRanges(shouldFetch ? patientUuid : undefined, conceptUuids);

  const observations = useMemo(
    () =>
      (observationsResponse?.data?.entry ?? []).map((entry) => ({
        ...toResultedObservation(entry.resource, conceptRanges?.get(entry.resource.code?.coding?.[0]?.code)),
        encounterUuid: referenceId(entry.resource.encounter?.reference),
      })),
    [observationsResponse, conceptRanges],
  );

  const notifications = useMemo(() => {
    if (!shouldFetch) {
      return [];
    }

    const sessionLocationUuid = session?.sessionLocation?.uuid;

    const derived = joinObservationsToOrders(orders, observations)
      .map(({ order, obs }) =>
        toNotification(order, obs, {
          notifyOnAbnormalNonCritical,
          optedIn: Boolean(optIns[optInKey(patientUuid, order.concept?.uuid)]),
        }),
      )
      .filter((notification): notification is SmartNotification => notification !== null)
      // Reviewed notifications leave the list and stay gone across reloads.
      .filter((notification) => !reviewed[notification.id])
      // Only surface a notification at the location where the order was placed. Orders with no
      // recorded location are always shown rather than silently hidden.
      .filter(
        (notification) =>
          !locationScoped ||
          !sessionLocationUuid ||
          !notification.locationUuid ||
          notification.locationUuid === sessionLocationUuid,
      );

    return sortNotifications(derived);
  }, [
    locationScoped,
    notifyOnAbnormalNonCritical,
    observations,
    optIns,
    orders,
    patientUuid,
    reviewed,
    session?.sessionLocation?.uuid,
    shouldFetch,
  ]);

  // The badge counts what the clinician has not opened yet. Reading a notification silences the
  // badge but leaves it in the inbox, so glancing at something never makes it disappear.
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !read[notification.id]).length,
    [notifications, read],
  );

  return {
    notifications,
    read,
    unreadCount,
    isLoading: shouldFetch && (isLoadingOrders || isLoadingObservations),
    error: ordersError ?? observationsError,
    mutate: () => {
      mutateOrders();
      mutateObservations();
    },
  };
}
