import { useMemo } from 'react';
import dayjs from 'dayjs';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { fhirBaseUrl, openmrsFetch, restBaseUrl, useConfig, useSession } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import type { DrugFavoriteOrder, DrugOrderSuggestion, DrugOrderTally } from './types';

// The FHIR module's default maximum page size (fhir2.paging.maximum)
const ORDERS_PAGE_SIZE = 100;
export const MAX_ORDERS_SCANNED = 200;
// When pins are full, a suggestion must have been ordered at least this many times as often as the least-ordered
// pin before we offer to swap them
const SWAP_MIN_ORDER_RATIO = 2;

const drugRepresentation =
  'custom:(uuid,display,name,strength,retired,dosageForm:(display,uuid),concept:(display,uuid))';

interface RecentProviderOrders {
  medicationRequests: Array<fhir.MedicationRequest>;
  total: number;
}

/**
 * Fetches up to MAX_ORDERS_SCANNED of the provider's most recent drug orders within the window. `_elements` keeps
 * only the drug and order date, so no patient details are loaded. openmrsFetch adds `_summary=data` to FHIR requests
 * that have no `_summary`, and the server rejects `_summary=data` combined with `_elements`, so we send
 * `_summary=false`.
 */
export async function fetchRecentProviderOrders(
  providerUuid: string,
  windowInDays: number,
): Promise<RecentProviderOrders> {
  const params = new URLSearchParams({
    requester: providerUuid,
    _lastUpdated: `ge${dayjs().subtract(windowInDays, 'day').format('YYYY-MM-DD')}`,
    _count: String(ORDERS_PAGE_SIZE),
    _summary: 'false',
    _elements: 'medication,authoredOn',
  });
  const { data: firstPage } = await openmrsFetch<fhir.Bundle>(`${fhirBaseUrl}/MedicationRequest?${params}`);
  const firstEntries = firstPage?.entry ?? [];
  const total = firstPage?.total ?? firstEntries.length;
  const nextLink = firstPage?.link?.find((link) => link.relation === 'next')?.url;

  if (total <= firstEntries.length || !nextLink) {
    return { medicationRequests: toMedicationRequests(firstEntries), total };
  }

  // Results come back oldest first and FHIR2 has no _sort for MedicationRequest, so we jump straight to the
  // newest orders by rewriting the paging offset. Only the query string of the paging link is reused because
  // its host may differ from ours behind a proxy. The link keeps `_elements` but drops `_summary`.
  const pagingParams = new URL(nextLink, window.location.href).searchParams;
  pagingParams.set('_summary', 'false');
  const startOffset = Math.max(0, total - MAX_ORDERS_SCANNED);
  const offsets: Array<number> = [];
  for (let offset = startOffset; offset < total; offset += ORDERS_PAGE_SIZE) {
    offsets.push(offset);
  }

  const pages = await Promise.all(
    offsets.map(async (offset) => {
      if (offset === 0) {
        return firstEntries;
      }
      const pageParams = new URLSearchParams(pagingParams);
      pageParams.set('_getpagesoffset', String(offset));
      const { data } = await openmrsFetch<fhir.Bundle>(`${fhirBaseUrl}?${pageParams}`);
      return data?.entry ?? [];
    }),
  );

  return { medicationRequests: toMedicationRequests(pages.flat()), total };
}

function toMedicationRequests(entries: Array<fhir.BundleEntry>) {
  return entries.map((entry) => entry.resource as fhir.MedicationRequest);
}

/**
 * Counts orders per drug. Orders for a concept or a non-coded drug have no medicationReference and are skipped,
 * since only a specific drug can be pinned.
 */
export function tallyDrugOrders(medicationRequests: Array<fhir.MedicationRequest>): Array<DrugOrderTally> {
  const tallies = new Map<string, DrugOrderTally>();

  medicationRequests.forEach((medicationRequest) => {
    const reference = medicationRequest.medicationReference?.reference;
    if (!reference?.startsWith('Medication/')) {
      return;
    }
    const drugUuid = reference.substring('Medication/'.length);
    const orderedAt = medicationRequest.authoredOn ?? '';
    const tally = tallies.get(drugUuid);

    if (tally) {
      tally.count += 1;
      if (dayjs(orderedAt).isAfter(tally.lastOrderedAt)) {
        tally.lastOrderedAt = orderedAt;
      }
    } else {
      tallies.set(drugUuid, { drugUuid, count: 1, lastOrderedAt: orderedAt });
    }
  });

  return [...tallies.values()];
}

// Most-ordered first; ties go to the drug ordered most recently
export function rankDrugOrderTallies(
  tallies: Array<DrugOrderTally>,
  excludedDrugUuids: Set<string>,
  minOrderCount: number,
): Array<DrugOrderTally> {
  return tallies
    .filter((tally) => tally.count >= minOrderCount && !excludedDrugUuids.has(tally.drugUuid))
    .sort((a, b) => b.count - a.count || dayjs(b.lastOrderedAt).diff(a.lastOrderedAt));
}

export interface SwapCandidate {
  suggestion: DrugOrderSuggestion;
  favorite: DrugFavoriteOrder;
  favoriteOrderCount: number;
}

export function findSwapCandidate(
  favorites: Array<DrugFavoriteOrder>,
  orderCounts: Map<string, number>,
  topSuggestion: DrugOrderSuggestion | undefined,
): SwapCandidate | null {
  if (!topSuggestion || !favorites.length) {
    return null;
  }

  const getCount = (favorite: DrugFavoriteOrder) => orderCounts.get(favorite.drugUuid) ?? 0;
  const leastOrdered = favorites.reduce((least, favorite) => (getCount(favorite) < getCount(least) ? favorite : least));
  const favoriteOrderCount = getCount(leastOrdered);

  if (topSuggestion.count < SWAP_MIN_ORDER_RATIO * favoriteOrderCount) {
    return null;
  }

  return { suggestion: topSuggestion, favorite: leastOrdered, favoriteOrderCount };
}

/**
 * Fetches the first `limit` drugs in ranked order that are still orderable. Retired drugs and drugs that fail to
 * load are skipped, so we keep working down the ranking until there are enough.
 */
export async function fetchSuggestedDrugs(rankedDrugUuids: Array<string>, limit: number): Promise<Array<Drug>> {
  const drugs: Array<Drug> = [];

  for (let start = 0; start < rankedDrugUuids.length && drugs.length < limit; ) {
    const batch = rankedDrugUuids.slice(start, start + limit - drugs.length);
    start += batch.length;
    const results = await Promise.allSettled(
      batch.map((drugUuid) =>
        openmrsFetch<Drug & { retired?: boolean }>(`${restBaseUrl}/drug/${drugUuid}?v=${drugRepresentation}`),
      ),
    );
    drugs.push(
      ...results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value.data)
        .filter((drug) => drug && !drug.retired),
    );
  }

  return drugs;
}

/**
 * Suggests drugs to pin from the ones the logged-in provider has ordered most often within the configured window,
 * so a suggestion is only ever a drug they already prescribe.
 */
export function useDrugOrderSuggestions(excludedDrugUuids: Set<string>, isEnabled: boolean) {
  const { drugOrderSuggestionsWindowInDays, maxDrugOrderSuggestions, minOrderCountForSuggestion } =
    useConfig<ConfigObject>();
  const { currentProvider } = useSession();
  const providerUuid = currentProvider?.uuid;

  const { data: recentOrders } = useSWR(
    isEnabled && providerUuid ? ['drugOrderSuggestions', providerUuid, drugOrderSuggestionsWindowInDays] : null,
    ([, uuid, windowInDays]) => fetchRecentProviderOrders(uuid, windowInDays),
  );

  const tallies = useMemo(() => (recentOrders ? tallyDrugOrders(recentOrders.medicationRequests) : []), [recentOrders]);
  const orderCounts = useMemo(() => new Map(tallies.map((tally) => [tally.drugUuid, tally.count])), [tallies]);
  const rankedTallies = useMemo(
    () => rankDrugOrderTallies(tallies, excludedDrugUuids, minOrderCountForSuggestion),
    [tallies, excludedDrugUuids, minOrderCountForSuggestion],
  );

  const drugUuids = rankedTallies.map((tally) => tally.drugUuid);
  // keepPreviousData stops the strip from flickering empty while a newly surfaced suggestion loads
  const { data: drugs } = useSWRImmutable(
    drugUuids.length ? ['suggestedDrugs', maxDrugOrderSuggestions, ...drugUuids] : null,
    ([, limit, ...uuids]) => fetchSuggestedDrugs(uuids, limit),
    { keepPreviousData: true },
  );

  const suggestions = useMemo((): Array<DrugOrderSuggestion> => {
    const drugsByUuid = new Map((drugs ?? []).map((drug) => [drug.uuid, drug]));
    return rankedTallies
      .filter((tally) => drugsByUuid.has(tally.drugUuid))
      .map((tally) => ({ ...tally, drug: drugsByUuid.get(tally.drugUuid) }));
  }, [rankedTallies, drugs]);

  return {
    suggestions,
    orderCounts,
    scannedOrderCount: recentOrders?.medicationRequests.length ?? 0,
    totalOrderCount: recentOrders?.total ?? 0,
    windowInDays: drugOrderSuggestionsWindowInDays,
  };
}
