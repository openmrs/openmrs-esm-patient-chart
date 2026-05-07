import { buildGeneralOrder, buildLabOrder, buildMedicationOrder } from './index';
import { mockOrders } from '__mocks__';

describe('order builders', () => {
  it('returns a medication basket item with a null visit when encounter visit is unavailable', () => {
    const orderWithoutVisit = {
      ...mockOrders[0],
      encounter: {
        ...mockOrders[0].encounter,
        visit: null,
      },
    };

    expect(buildMedicationOrder(orderWithoutVisit as any, 'RENEW')).toEqual(
      expect.objectContaining({
        encounterUuid: mockOrders[0].encounter.uuid,
        visit: null,
      }),
    );
  });

  it('returns lab and general basket items with a null visit when encounter data is unavailable', () => {
    const orderWithoutEncounter = {
      ...mockOrders[1],
      encounter: null,
    };

    expect(buildLabOrder(orderWithoutEncounter as any, 'REVISE')).toEqual(
      expect.objectContaining({
        encounterUuid: undefined,
        visit: null,
      }),
    );

    expect(buildGeneralOrder(orderWithoutEncounter as any, 'DISCONTINUE')).toEqual(
      expect.objectContaining({
        encounterUuid: undefined,
        visit: null,
      }),
    );
  });
});
