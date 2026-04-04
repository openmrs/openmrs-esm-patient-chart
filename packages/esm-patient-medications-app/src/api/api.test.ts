import { buildMedicationOrder } from './api';
import { mockOrders } from '__mocks__';

describe('buildMedicationOrder', () => {
  it('returns a basket item with a null visit when the source order has no encounter visit', () => {
    const orderWithoutVisit = {
      ...mockOrders[0],
      encounter: {
        ...mockOrders[0].encounter,
        visit: null,
      },
    };

    expect(buildMedicationOrder(orderWithoutVisit as any, 'REVISE')).toEqual(
      expect.objectContaining({
        encounterUuid: mockOrders[0].encounter.uuid,
        visit: null,
      }),
    );
  });

  it('returns a basket item with no encounter UUID when the source order has no encounter', () => {
    const orderWithoutEncounter = {
      ...mockOrders[0],
      encounter: null,
    };

    expect(buildMedicationOrder(orderWithoutEncounter as any, 'DISCONTINUE')).toEqual(
      expect.objectContaining({
        encounterUuid: undefined,
        visit: null,
      }),
    );
  });
});
