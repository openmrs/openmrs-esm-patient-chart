import { type FetchResponse, openmrsFetch, type Visit } from '@openmrs/esm-framework';
import type { DrugOrderPost, OrderPost } from './types';
import { postOrderOnNewEncounter } from './postOrders';

const mockedOpenmrsFetch = jest.mocked(openmrsFetch);

const mockOrder: DrugOrderPost = {
  action: 'NEW',
  patient: 'patient-uuid',
  type: 'drugorder',
  careSetting: 'care-setting-uuid',
  orderer: 'provider-uuid',
  encounter: null,
  drug: 'drug-uuid',
  dose: 1,
  doseUnits: 'unit-uuid',
  route: 'route-uuid',
  frequency: 'frequency-uuid',
  asNeeded: false,
  asNeededCondition: null,
  numRefills: 0,
  quantity: 5,
  quantityUnits: 'unit-uuid',
  duration: 5,
  durationUnits: 'duration-unit-uuid',
  dosingType: 'org.openmrs.SimpleDosingInstructions',
  dosingInstructions: '',
  concept: 'concept-uuid',
};

const mockActiveVisit: Visit = {
  uuid: 'visit-uuid',
  startDatetime: '2026-05-04T06:33:00.000+0000',
  stopDatetime: null,
} as Visit;

describe('postOrderOnNewEncounter', () => {
  beforeEach(() => {
    mockedOpenmrsFetch.mockReset();
    mockedOpenmrsFetch.mockResolvedValue({
      data: { uuid: 'new-encounter-uuid' },
    } as FetchResponse);
  });

  it('posts to the encounter endpoint with the supplied encounterDate', async () => {
    const encounterDate = new Date('2026-05-05T00:00:00.000Z');

    await postOrderOnNewEncounter(
      mockOrder,
      'patient-uuid',
      'encounter-type-uuid',
      mockActiveVisit,
      'location-uuid',
      undefined,
      encounterDate,
    );

    expect(mockedOpenmrsFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockedOpenmrsFetch.mock.calls[0];
    expect(url).toMatch(/\/encounter$/);
    expect(init?.method).toBe('POST');
    expect((init?.body as { encounterDatetime?: Date }).encounterDatetime).toBe(encounterDate);
  });

  it('wraps the supplied order as the only order on the encounter payload', async () => {
    await postOrderOnNewEncounter(
      mockOrder,
      'patient-uuid',
      'encounter-type-uuid',
      mockActiveVisit,
      'location-uuid',
      undefined,
      new Date(),
    );

    const [, init] = mockedOpenmrsFetch.mock.calls[0];
    const body = init?.body as { orders: OrderPost[]; visit?: string; patient: string; location: string };
    expect(body.orders).toEqual([mockOrder]);
    expect(body.visit).toBe('visit-uuid');
    expect(body.patient).toBe('patient-uuid');
    expect(body.location).toBe('location-uuid');
  });

  it('omits encounterDatetime when none is supplied and the visit is active', async () => {
    await postOrderOnNewEncounter(mockOrder, 'patient-uuid', 'encounter-type-uuid', mockActiveVisit, 'location-uuid');

    const [, init] = mockedOpenmrsFetch.mock.calls[0];
    expect((init?.body as { encounterDatetime?: Date }).encounterDatetime).toBeUndefined();
  });

  it('falls back to the visit start when no encounterDate is supplied and the visit is stopped', async () => {
    const stoppedVisit: Visit = {
      uuid: 'visit-uuid',
      startDatetime: '2026-05-04T06:33:00.000+0000',
      stopDatetime: '2026-05-05T18:00:00.000+0000',
    } as Visit;

    await postOrderOnNewEncounter(mockOrder, 'patient-uuid', 'encounter-type-uuid', stoppedVisit, 'location-uuid');

    const [, init] = mockedOpenmrsFetch.mock.calls[0];
    const date = (init?.body as { encounterDatetime?: Date }).encounterDatetime;
    expect(date).toBeInstanceOf(Date);
    expect(date?.toISOString()).toBe(new Date('2026-05-04T06:33:00.000+0000').toISOString());
  });
});
