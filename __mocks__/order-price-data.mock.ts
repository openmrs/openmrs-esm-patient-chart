import type { OrderPriceData } from '@openmrs/esm-patient-orders-app/src/types/order';

export const mockOrderPriceData: OrderPriceData = {
  resourceType: 'Bundle',
  id: 'test-id',
  meta: {
    lastUpdated: '2024-01-01T00:00:00Z',
  },
  type: 'searchset',
  link: [
    {
      relation: 'self',
      url: 'test-url',
    },
  ],
  entry: [
    {
      resource: {
        resourceType: 'ChargeItemDefinition',
        id: 'test-resource-id',
        name: 'Test Item',
        status: 'active',
        date: '2024-01-01',
        propertyGroup: [
          {
            priceComponent: [
              {
                type: 'base',
                amount: {
                  value: 99.99,
                  currency: 'USD',
                },
              },
            ],
          },
        ],
      },
    },
  ],
};
