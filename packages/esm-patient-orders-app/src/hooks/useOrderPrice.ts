import { type OrderPriceData } from '../types/order';
import { fhirBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useMemo } from 'react';

export const useOrderPrice = (orderItemUuid: string) => {
  const { data, isLoading } = useSWR(
    orderItemUuid ? `${fhirBaseUrl}/ChargeItemDefinition?code=${orderItemUuid}` : null,
    async (): Promise<OrderPriceData> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            resourceType: 'Bundle',
            id: '4c2b7e55-b7b3-4ae2-a144-99ea1d01a21a',
            meta: {
              lastUpdated: '2024-09-11T18:17:57.249+03:00',
            },
            type: 'searchset',
            link: [
              {
                relation: 'self',
                url: 'http://localhost:8080/odoo/R4/ChargeItemDefinition?code=af3fce1f-dcb1-4f76-ad4c-b8ebda43070c',
              },
            ],
            entry: [
              {
                resource: {
                  resourceType: 'ChargeItemDefinition',
                  id: 'af3fce1f-dcb1-4f76-ad4c-b8ebda43070c',
                  name: 'Vitamine B-Complex Injection',
                  status: 'active',
                  date: '2024-09-03T13:59:50+03:00',
                  propertyGroup: [
                    {
                      priceComponent: [
                        {
                          type: 'base',
                          amount: {
                            value: 1.08,
                            currency: '$',
                          },
                        },
                      ],
                    },
                  ],
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
