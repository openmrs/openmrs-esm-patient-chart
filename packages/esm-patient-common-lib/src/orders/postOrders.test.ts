import { openmrsFetch, parseDate, toOmrsIsoString, type Visit } from '@openmrs/esm-framework';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { orderBasketStore, _resetOrderBasketStore } from './store';
import { type EncounterPost, postOrdersOnNewEncounter } from './postOrders';
import { type OrderPost, type PostDataPrepFunction } from './types';

const patientUuid = 'patient-uuid';
const encounterType = 'encounter-type-uuid';
const locationUuid = 'location-uuid';
const ordererUuid = 'orderer-uuid';

const openVisit = {
  uuid: 'visit-uuid',
  startDatetime: '2026-05-01T08:00:00.000Z',
} as Visit;

const closedVisit = {
  uuid: 'visit-uuid',
  startDatetime: '2026-04-01T08:00:00.000Z',
  stopDatetime: '2026-04-02T08:00:00.000Z',
} as Visit;

/** Seeds the basket with orders that are POSTed verbatim (the prep function is the identity). */
function seedBasket(orders: Array<OrderPost>) {
  orderBasketStore.setState({
    items: { [patientUuid]: { medications: orders as never } },
    postDataPrepFunctions: { medications: ((order: OrderPost) => order) as unknown as PostDataPrepFunction },
  });
}

async function postAndCaptureEncounter(visit: Visit | null): Promise<EncounterPost> {
  await postOrdersOnNewEncounter(patientUuid, encounterType, visit, locationUuid, ordererUuid);
  return vi.mocked(openmrsFetch).mock.calls[0][1].body as EncounterPost;
}

/** The core backend invariant this logic exists to preserve: `dateActivated >= encounterDatetime`. */
function expectOrdersActivatedAtOrAfterEncounter(body: EncounterPost) {
  if (!body.encounterDatetime) {
    return;
  }
  const encounter = new Date(body.encounterDatetime).getTime();
  for (const order of body.orders) {
    if (order.dateActivated) {
      expect(new Date(order.dateActivated).getTime()).toBeGreaterThanOrEqual(encounter);
    }
  }
}

describe('postOrdersOnNewEncounter', () => {
  beforeEach(() => {
    _resetOrderBasketStore();
    vi.mocked(openmrsFetch).mockResolvedValue({ data: { uuid: 'new-encounter-uuid', orders: [] } } as never);
  });

  it('omits encounterDatetime and order dateActivated for a "start now" order in an open visit', async () => {
    seedBasket([{ action: 'NEW' }]);

    const body = await postAndCaptureEncounter(openVisit);

    expect(body.encounterDatetime).toBeUndefined();
    expect(body.orders[0].dateActivated).toBeUndefined();
    expectOrdersActivatedAtOrAfterEncounter(body);
  });

  it('pins the encounter to the earliest explicit dateActivated in an open visit', async () => {
    seedBasket([{ action: 'NEW', dateActivated: '2026-05-12T09:00:00.000Z' }, { action: 'NEW' }]);

    const body = await postAndCaptureEncounter(openVisit);

    expect((body.encounterDatetime as Date).toISOString()).toBe('2026-05-12T09:00:00.000Z');
    // The back-dated order keeps its date; the "start now" order stays server-stamped.
    expect(body.orders[0].dateActivated).toBe('2026-05-12T09:00:00.000Z');
    expect(body.orders[1].dateActivated).toBeUndefined();
    expectOrdersActivatedAtOrAfterEncounter(body);
  });

  it('pins a "start now" order in a closed (retrospective) visit to the visit-derived encounter datetime', async () => {
    seedBasket([{ action: 'NEW' }]);

    const body = await postAndCaptureEncounter(closedVisit);

    const expected = parseDate(closedVisit.startDatetime);
    expect((body.encounterDatetime as Date).toISOString()).toBe(expected.toISOString());
    expect(body.orders[0].dateActivated).toBe(toOmrsIsoString(expected));
    expectOrdersActivatedAtOrAfterEncounter(body);
  });

  it('pins a general-style order (scheduledDate null, no dateActivated) to the encounter in a closed visit', async () => {
    // General/lab order prep functions emit `scheduledDate: null` and never a `dateActivated`.
    seedBasket([{ action: 'NEW', scheduledDate: null as never }]);

    const body = await postAndCaptureEncounter(closedVisit);

    const expected = parseDate(closedVisit.startDatetime);
    expect(body.orders[0].dateActivated).toBe(toOmrsIsoString(expected));
    expectOrdersActivatedAtOrAfterEncounter(body);
  });

  it('does not fill dateActivated for a future-scheduled order in a closed visit', async () => {
    seedBasket([{ action: 'NEW', scheduledDate: '2026-08-01T00:00:00.000Z', urgency: 'ON_SCHEDULED_DATE' }]);

    const body = await postAndCaptureEncounter(closedVisit);

    expect(body.orders[0].dateActivated).toBeUndefined();
    expect(body.orders[0].scheduledDate).toBe('2026-08-01T00:00:00.000Z');
    expectOrdersActivatedAtOrAfterEncounter(body);
  });

  it('clamps the encounter to the visit start and raises orders that fall below it', async () => {
    // An explicit dateActivated before the visit start would violate the visit-window constraint.
    seedBasket([{ action: 'NEW', dateActivated: '2026-04-25T09:00:00.000Z' }]);

    const body = await postAndCaptureEncounter(openVisit);

    const visitStart = parseDate(openVisit.startDatetime);
    expect((body.encounterDatetime as Date).toISOString()).toBe(visitStart.toISOString());
    expect(body.orders[0].dateActivated).toBe(toOmrsIsoString(visitStart));
    expectOrdersActivatedAtOrAfterEncounter(body);
  });

  it('clamps the encounter to the visit stop but leaves an order activated after the visit closed', async () => {
    // Orders may legitimately activate after the visit stop, so the order date is preserved while
    // the encounter itself is pulled back into the visit window.
    seedBasket([{ action: 'NEW', dateActivated: '2026-04-05T00:00:00.000Z' }]);

    const body = await postAndCaptureEncounter(closedVisit);

    const visitStop = parseDate(closedVisit.stopDatetime);
    expect((body.encounterDatetime as Date).toISOString()).toBe(visitStop.toISOString());
    expect(body.orders[0].dateActivated).toBe('2026-04-05T00:00:00.000Z');
    expectOrdersActivatedAtOrAfterEncounter(body);
  });

  it('handles a mixed basket (back-dated, start-now, future) in a closed visit', async () => {
    seedBasket([
      { action: 'NEW', dateActivated: '2026-04-01T12:00:00.000Z' },
      { action: 'NEW' },
      { action: 'NEW', scheduledDate: '2026-08-01T00:00:00.000Z', urgency: 'ON_SCHEDULED_DATE' },
    ]);

    const body = await postAndCaptureEncounter(closedVisit);

    const expectedEncounter = new Date('2026-04-01T12:00:00.000Z');
    expect((body.encounterDatetime as Date).toISOString()).toBe(expectedEncounter.toISOString());
    // Back-dated order kept; start-now pinned to the encounter; future order left scheduled.
    expect(body.orders[0].dateActivated).toBe('2026-04-01T12:00:00.000Z');
    expect(body.orders[1].dateActivated).toBe(toOmrsIsoString(expectedEncounter));
    expect(body.orders[2].dateActivated).toBeUndefined();
    expect(body.orders[2].scheduledDate).toBe('2026-08-01T00:00:00.000Z');
    expectOrdersActivatedAtOrAfterEncounter(body);
  });

  it('throws with the offending value when an order carries an invalid dateActivated', async () => {
    seedBasket([{ action: 'NEW', dateActivated: 'not-a-date' }]);

    await expect(
      postOrdersOnNewEncounter(patientUuid, encounterType, openVisit, locationUuid, ordererUuid),
    ).rejects.toThrow('not-a-date');
    expect(openmrsFetch).not.toHaveBeenCalled();
  });
});
