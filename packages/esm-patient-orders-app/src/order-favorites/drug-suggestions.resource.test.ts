import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch } from '@openmrs/esm-framework';
import {
  MAX_ORDERS_SCANNED,
  fetchRecentProviderOrders,
  fetchSuggestedDrugs,
  findSwapCandidate,
  rankDrugOrderTallies,
  tallyDrugOrders,
} from './drug-suggestions.resource';
import type { DrugFavoriteOrder, DrugOrderSuggestion, DrugOrderTally } from './types';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const makeMedicationRequest = (drugUuid: string, authoredOn: string): fhir.MedicationRequest =>
  ({
    resourceType: 'MedicationRequest',
    medicationReference: { reference: `Medication/${drugUuid}` },
    authoredOn,
  }) as fhir.MedicationRequest;

const makeTally = (overrides: Partial<DrugOrderTally>): DrugOrderTally => ({
  drugUuid: 'drug-1',
  count: 1,
  lastOrderedAt: '2026-01-01T00:00:00+00:00',
  ...overrides,
});

describe('tallyDrugOrders', () => {
  it('counts orders per drug and keeps the most recent order date', () => {
    const tallies = tallyDrugOrders([
      makeMedicationRequest('metformin', '2026-09-01T10:00:00+00:00'),
      makeMedicationRequest('metformin', '2026-10-01T10:00:00+00:00'),
      makeMedicationRequest('metformin', '2026-08-01T10:00:00+00:00'),
      makeMedicationRequest('aspirin', '2026-09-15T10:00:00+00:00'),
    ]);

    expect(tallies).toEqual(
      expect.arrayContaining([
        { drugUuid: 'metformin', count: 3, lastOrderedAt: '2026-10-01T10:00:00+00:00' },
        { drugUuid: 'aspirin', count: 1, lastOrderedAt: '2026-09-15T10:00:00+00:00' },
      ]),
    );
    expect(tallies).toHaveLength(2);
  });

  it('skips orders that are not for a specific drug', () => {
    const conceptOnlyOrder = {
      resourceType: 'MedicationRequest',
      medicationCodeableConcept: { text: 'Some non-coded drug' },
      authoredOn: '2026-09-01T10:00:00+00:00',
    } as fhir.MedicationRequest;

    expect(tallyDrugOrders([conceptOnlyOrder])).toEqual([]);
  });
});

describe('rankDrugOrderTallies', () => {
  it('ranks by order count, breaking ties by the most recent order', () => {
    const ranked = rankDrugOrderTallies(
      [
        makeTally({ drugUuid: 'older', count: 5, lastOrderedAt: '2026-08-01T00:00:00+00:00' }),
        makeTally({ drugUuid: 'most', count: 9 }),
        makeTally({ drugUuid: 'newer', count: 5, lastOrderedAt: '2026-09-01T00:00:00+00:00' }),
      ],
      new Set(),
      1,
    );

    expect(ranked.map((tally) => tally.drugUuid)).toEqual(['most', 'newer', 'older']);
  });

  it('drops excluded drugs and drugs below the minimum order count', () => {
    const ranked = rankDrugOrderTallies(
      [
        makeTally({ drugUuid: 'pinned', count: 20 }),
        makeTally({ drugUuid: 'rare', count: 2 }),
        makeTally({ drugUuid: 'a', count: 10 }),
        makeTally({ drugUuid: 'b', count: 8 }),
      ],
      new Set(['pinned']),
      3,
    );

    expect(ranked.map((tally) => tally.drugUuid)).toEqual(['a', 'b']);
  });
});

describe('fetchSuggestedDrugs', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('skips retired and unavailable drugs, fetching further down the ranking until it has enough', async () => {
    mockOpenmrsFetch.mockImplementation(async (url: string) => {
      const drugUuid = url.match(/\/drug\/([^?]+)/)[1];
      if (drugUuid === 'deleted') {
        throw new Error('Not found');
      }
      return { data: { uuid: drugUuid, display: drugUuid, retired: drugUuid === 'retired' } } as never;
    });

    const drugs = await fetchSuggestedDrugs(['retired', 'a', 'deleted', 'b', 'c'], 2);

    expect(drugs.map((drug) => drug.uuid)).toEqual(['a', 'b']);
    // 'c' is never fetched because two active drugs were found first
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(4);
  });
});

describe('fetchRecentProviderOrders', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('queries the provider orders within the window without loading patient details', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({
      data: { total: 1, entry: [{ resource: makeMedicationRequest('aspirin', '2026-09-01T00:00:00+00:00') }] },
    } as never);

    const result = await fetchRecentProviderOrders('provider-uuid', 90);

    const url = new URL(mockOpenmrsFetch.mock.calls[0][0] as string, 'http://localhost');
    expect(url.pathname).toBe('/ws/fhir2/R4/MedicationRequest');
    expect(url.searchParams.get('requester')).toBe('provider-uuid');
    expect(url.searchParams.get('_lastUpdated')).toMatch(/^ge\d{4}-\d{2}-\d{2}$/);
    // An explicit _summary stops openmrsFetch adding _summary=data, which the server rejects alongside _elements.
    expect(url.searchParams.get('_elements')).toBe('medication,authoredOn');
    expect(url.searchParams.get('_summary')).toBe('false');
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
    expect(result.medicationRequests).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('jumps to the newest orders when there are more than can be scanned', async () => {
    const total = 450;
    mockOpenmrsFetch.mockResolvedValueOnce({
      data: {
        total,
        entry: [{ resource: makeMedicationRequest('oldest', '2026-01-01T00:00:00+00:00') }],
        link: [
          {
            relation: 'next',
            url: 'https://other-host/openmrs/ws/fhir2/R4?_getpages=search-id&_getpagesoffset=100&_count=100',
          },
        ],
      },
    } as never);
    mockOpenmrsFetch.mockResolvedValue({
      data: { entry: [{ resource: makeMedicationRequest('recent', '2026-10-01T00:00:00+00:00') }] },
    } as never);

    const result = await fetchRecentProviderOrders('provider-uuid', 90);

    const pageUrls = mockOpenmrsFetch.mock.calls.slice(1).map(([url]) => url as string);
    expect(pageUrls).toEqual([
      `/ws/fhir2/R4?_getpages=search-id&_getpagesoffset=${total - MAX_ORDERS_SCANNED}&_count=100&_summary=false`,
      `/ws/fhir2/R4?_getpages=search-id&_getpagesoffset=${total - MAX_ORDERS_SCANNED + 100}&_count=100&_summary=false`,
    ]);
    expect(result.medicationRequests.map((request) => request.medicationReference.reference)).toEqual([
      'Medication/recent',
      'Medication/recent',
    ]);
    expect(result.total).toBe(total);
  });

  it('reuses the first page when all orders fit within the scan limit', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({
      data: {
        total: 150,
        entry: [{ resource: makeMedicationRequest('first-page', '2026-09-01T00:00:00+00:00') }],
        link: [{ relation: 'next', url: '/ws/fhir2/R4?_getpages=search-id&_getpagesoffset=100&_count=100' }],
      },
    } as never);
    mockOpenmrsFetch.mockResolvedValueOnce({
      data: { entry: [{ resource: makeMedicationRequest('second-page', '2026-10-01T00:00:00+00:00') }] },
    } as never);

    const result = await fetchRecentProviderOrders('provider-uuid', 90);

    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2);
    expect(mockOpenmrsFetch.mock.calls[1][0]).toBe(
      '/ws/fhir2/R4?_getpages=search-id&_getpagesoffset=100&_count=100&_summary=false',
    );
    expect(result.medicationRequests.map((request) => request.medicationReference.reference)).toEqual([
      'Medication/first-page',
      'Medication/second-page',
    ]);
  });
});

describe('findSwapCandidate', () => {
  const makeFavorite = (drugUuid: string): DrugFavoriteOrder => ({
    id: `favorite-${drugUuid}`,
    drugUuid,
    displayName: drugUuid,
    attributes: {},
  });
  const topSuggestion = { ...makeTally({ drugUuid: 'metformin', count: 18 }), drug: {} } as DrugOrderSuggestion;

  it('pairs the top suggestion with the least-ordered pin', () => {
    const candidate = findSwapCandidate(
      [makeFavorite('ibuprofen'), makeFavorite('never-ordered'), makeFavorite('paracetamol')],
      new Map([
        ['ibuprofen', 2],
        ['paracetamol', 9],
      ]),
      topSuggestion,
    );

    expect(candidate).toEqual({
      suggestion: topSuggestion,
      favorite: makeFavorite('never-ordered'),
      favoriteOrderCount: 0,
    });
  });

  it('only offers a swap when the suggestion was ordered at least twice as often', () => {
    expect(findSwapCandidate([makeFavorite('ibuprofen')], new Map([['ibuprofen', 9]]), topSuggestion)).not.toBeNull();
    expect(findSwapCandidate([makeFavorite('ibuprofen')], new Map([['ibuprofen', 10]]), topSuggestion)).toBeNull();
  });

  it('offers no swap without a suggestion or pins', () => {
    expect(findSwapCandidate([makeFavorite('ibuprofen')], new Map(), undefined)).toBeNull();
    expect(findSwapCandidate([], new Map(), topSuggestion)).toBeNull();
  });
});
