import { type OrderStockData } from '../types/order';

import useSWR from 'swr';
import { fhirBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';

export const useOrderStockInfo = (orderItemUuid: string) => {
  const { data, isLoading } = useSWR(
    orderItemUuid ? `${fhirBaseUrl}/ChargeItemDefinition?code=${orderItemUuid}` : null,
    async (): Promise<OrderStockData> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            resourceType: 'Bundle',
            id: '73e12fd2-b13c-4675-b7f4-704dff90bb1d',
            meta: {
              lastUpdated: '2024-09-10T10:56:28.983+03:00',
            },
            type: 'searchset',
            link: [
              {
                relation: 'self',
                url: 'http://localhost:8080/odoo/R4/InventoryItem?code=af3fce1f-dcb1-4f76-ad4c-b8ebda43070c',
              },
            ],
            entry: [
              {
                resource: {
                  resourceType: 'InventoryItem',
                  id: 'af3fce1f-dcb1-4f76-ad4c-b8ebda43070c',
                  meta: {
                    profile: ['http://hl7.org/fhir/StructureDefinition/InventoryItem'],
                  },
                  status: 'active',
                  code: [
                    {
                      coding: [
                        {
                          system: 'https://fhir.openmrs.org/concept-system/inventory-item',
                          code: 'af3fce1f-dcb1-4f76-ad4c-b8ebda43070c',
                          display: 'Vitamine B-Complex Injection',
                        },
                      ],
                    },
                  ],
                  name: [
                    {
                      name: 'Vitamine B-Complex Injection',
                    },
                  ],
                  netContent: {
                    value: 220.0,
                    unit: 'Ampule(s)',
                  },
                },
              },
            ],
          });
        }, 3000);
      });
    },
  );

  return useMemo(
    () => ({
      data,
      isLoading,
    }),
    [data, isLoading],
  );
};
