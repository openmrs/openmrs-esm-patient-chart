// import { useState, useEffect } from 'react';
// import { OrderStockData } from '../types/order'; // Adjust based on path

export const useOrderStockInfo = (code: string) => {
  // const [stock, setStock] = useState<OrderStockData | null>(null);
  //
  // useEffect(() => {
  //   const fetchStock = async () => {
  //     const response = await fetch(`http://localhost:8080/odoo/R4/InventoryItem?code=${code}`);
  //     const data: OrderStockData = await response.json();
  //     setStock(data.entry[0]); // Get the first entry
  //   };
  //
  //   fetchStock();
  // }, [code]);

  return {
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
  };
};
