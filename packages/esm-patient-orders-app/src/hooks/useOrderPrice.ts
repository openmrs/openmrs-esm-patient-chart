// import { useState, useEffect } from 'react';
// import { OrderPriceData } from '../types/order'; // Adjust based on path

export const useOrderPrice = (code: string) => {
  // const [price, setPrice] = useState<OrderPriceData | null>(null);
  //
  // useEffect(() => {
  //   const fetchPrice = async () => {
  //     const response = await fetch(`http://localhost:8080/odoo/R4/ChargeItemDefinition?code=${code}`);
  //     const data: OrderPriceData = await response.json();
  //     setPrice(data.entry[0]); // Get the first entry
  //   };
  //
  //   fetchPrice();
  // }, [code]);

  return {
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
};
