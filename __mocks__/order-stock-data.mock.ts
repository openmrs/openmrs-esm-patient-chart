export const mockOrderStockData = {
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
        resourceType: 'InventoryItem',
        id: 'test-resource-id',
        meta: {
          profile: ['test-profile'],
        },
        status: 'active',
        code: [
          {
            coding: [
              {
                system: 'test-system',
                code: 'test-code',
                display: 'Test Item',
              },
            ],
          },
        ],
        name: [
          {
            name: 'Test Item',
          },
        ],
        netContent: {
          value: 10,
          unit: 'units',
        },
      },
    },
  ],
};
