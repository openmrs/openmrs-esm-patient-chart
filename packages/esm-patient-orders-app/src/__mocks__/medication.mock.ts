import type { Drug } from '../types/order';

export const mockDrugSearchResultItems: Array<Drug> = [
  {
    uuid: '09e58895-e7f0-4649-b7c0-e665c5c08e93',
    display: 'Aspirin',
    strength: '81mg',
    dosageForm: { display: 'Tablet', uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    concept: { display: 'Aspirin', uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
  },
  {
    uuid: '38087db3-7395-431f-88d5-bb25e06e33f1',
    display: 'Aspirin',
    strength: '325mg',
    dosageForm: { display: 'Tablet', uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    concept: { display: 'Aspirin', uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
  },
  {
    uuid: 'a722710f-403b-451f-804b-09f8624b0838',
    display: 'Aspirin',
    strength: '162.5mg',
    dosageForm: { display: 'Tablet', uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    concept: { display: 'Aspirin', uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
  },
  {
    uuid: '02dd2a8e-1a8f-49cb-bc06-daf9e1af16ba',
    display: 'Aspirine Co',
    strength: '81mg',
    dosageForm: { display: 'Tablet', uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    concept: { display: 'Aspirin', uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
  },
];

export const mockDrugOrderTemplates = {
  '09e58895-e7f0-4649-b7c0-e665c5c08e93': [
    {
      uuid: '270527a4-4cd9-4a84-8a11-f86e3d89f885',
      display: 'Another template',
      name: 'Another template',
      description: 'For demo purposes',
      template: {
        type: 'https://schema.openmrs.org/order/template/drug/simple/v1',
        dosingType: 'org.openmrs.SimpleDosingInstructions',
        dosingInstructions: {
          dose: [
            {
              value: 1,
              default: true,
            },
          ],
          unit: [
            {
              value: 'mg',
              valueCoded: '161553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              default: true,
            },
          ],
          route: [
            {
              value: 'oral',
              valueCoded: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              default: true,
            },
          ],
          frequency: [
            {
              value: 'twice daily',
              valueCoded: '160858AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              default: true,
            },
          ],
          asNeeded: false,
          asNeededCondition: 'Some value here..',
          instructions: [
            {
              value: 'with or without food',
              default: true,
            },
          ],
        },
      },
      retired: false,
      drug: {
        uuid: '09e58895-e7f0-4649-b7c0-e665c5c08e93',
        display: 'Aspirin 81mg',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/drug/09e58895-e7f0-4649-b7c0-e665c5c08e93',
            resourceAlias: 'drug',
          },
        ],
      },
      concept: {
        uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Aspirin',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            resourceAlias: 'concept',
          },
        ],
      },
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertemplates/orderTemplate/270527a4-4cd9-4a84-8a11-f86e3d89f885',
          resourceAlias: 'orderTemplate',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertemplates/orderTemplate/270527a4-4cd9-4a84-8a11-f86e3d89f885?v=full',
          resourceAlias: 'orderTemplate',
        },
      ],
    },
  ],
  '02dd2a8e-1a8f-49cb-bc06-daf9e1af16ba': [
    {
      uuid: '6b8de2bd-7fd5-432a-b215-861400f87e39',
      display: 'Demo template',
      name: 'Demo template',
      description: 'For demo purposes',
      template: {
        type: 'https://schema.openmrs.org/order/template/drug/simple/v1',
        dosingType: 'org.openmrs.SimpleDosingInstructions',
        dosingInstructions: {
          dose: [
            {
              value: 300,
              default: true,
            },
          ],
          unit: [
            {
              value: 'mg',
              valueCoded: '161553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              default: true,
            },
          ],
          route: [
            {
              value: 'oral',
              valueCoded: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              default: true,
            },
          ],
          frequency: [
            {
              value: 'once daily',
              valueCoded: '160858AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              default: true,
            },
          ],
          asNeeded: false,
          asNeededCondition: 'Some value here..',
          instructions: [
            {
              value: 'with or without food',
              default: true,
            },
          ],
        },
      },
      retired: false,
      drug: {
        uuid: '09e58895-e7f0-4649-b7c0-e665c5c08e93',
        display: 'Aspirin 81mg',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/drug/09e58895-e7f0-4649-b7c0-e665c5c08e93',
            resourceAlias: 'drug',
          },
        ],
      },
      concept: {
        uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Aspirin',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            resourceAlias: 'concept',
          },
        ],
      },
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertemplates/orderTemplate/6b8de2bd-7fd5-432a-b215-861400f87e39',
          resourceAlias: 'orderTemplate',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertemplates/orderTemplate/6b8de2bd-7fd5-432a-b215-861400f87e39?v=full',
          resourceAlias: 'orderTemplate',
        },
      ],
    },
  ],
};

export const mockMedicationOrderSearchResults = [
  {
    action: 'NEW',
    drug: {
      uuid: '18f43c99-2329-426e-97b5-c3356e6afe54',
      name: 'Aspirin',
      display: 'Aspirin',
      strength: '81mg',
      dosageForm: {
        display: 'Tablet',
        uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      concept: {
        uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Aspirin',
        name: {
          display: 'Aspirin',
          uuid: '124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          name: 'Aspirin',
          locale: 'en',
          localePreferred: true,
          conceptNameType: null,

          resourceVersion: '1.9',
        },
        datatype: {
          uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
          display: 'N/A',
        },
        conceptClass: {
          uuid: '8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
          display: 'Drug',
        },
        set: false,
        version: null,
        retired: false,
        descriptions: [
          {
            uuid: '2729FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            display: 'dawa ya kupunguza maumivu',
          },
          {
            uuid: '16090FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            display: 'Name of a drug which is used as anti inflammatory and analgesic',
          },
        ],
        answers: [],
        setMembers: [],
        attributes: [],

        resourceVersion: '2.0',
      },
    },
    dosage: 81,
    unit: {
      valueCoded: '3013AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      value: 'mg',
    },
    frequency: {
      value: 'Once daily',
      valueCoded: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    route: {
      value: 'Oral',
      valueCoded: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    encounterUuid: '8450ae45-8702-4edd-9541-4f9a75263eab',
    commonMedicationName: 'Aspirin',
    isFreeTextDosage: false,
    patientInstructions: '',
    asNeeded: false,
    asNeededCondition: '',
    startDate: '2021-09-07T19:24:32.904Z',
    duration: null,
    durationUnit: {
      uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Days',
    },
    pillsDispensed: 0,
    numRefills: 0,
    freeTextDosage: '',
    indication: '',
  },
  {
    action: 'NEW',
    drug: {
      uuid: '18f43c99-2329-426e-97b5-c3356e6afe54',
      name: 'Aspirin',
      display: 'Aspirin',
      strength: '125mg',
      dosageForm: {
        display: 'Tablet',
        uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      concept: {
        uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Aspirin',
        name: {
          display: 'Aspirin',
          uuid: '124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          name: 'Aspirin',
          locale: 'en',
          localePreferred: true,
          conceptNameType: null,
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            },
            {
              rel: 'full',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
            },
          ],
          resourceVersion: '1.9',
        },
        datatype: {
          uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
          display: 'N/A',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
            },
          ],
        },
        conceptClass: {
          uuid: '8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
          display: 'Drug',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptclass/8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
            },
          ],
        },
        set: false,
        version: null,
        retired: false,
        descriptions: [
          {
            uuid: '2729FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            display: 'dawa ya kupunguza maumivu',
          },
          {
            uuid: '16090FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            display: 'Name of a drug which is used as anti inflammatory and analgesic',
            links: [
              {
                rel: 'self',
                uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16090FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
              },
            ],
          },
        ],
        answers: [],
        setMembers: [],
        attributes: [],
        resourceVersion: '2.0',
      },
    },
    dosage: {
      value: 162,
    },
    unit: {
      valueCoded: '3013AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      value: 'mg',
    },
    dosageUnit: {
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      name: 'Tablet',
      selected: true,
    },
    frequency: {
      value: 'Once daily',
      valueCoded: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    route: {
      value: 'Oral',
      valueCoded: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    encounterUuid: '8450ae45-8702-4edd-9541-4f9a75263eab',
    commonMedicationName: 'Aspirin',
    isFreeTextDosage: false,
    patientInstructions: '',
    asNeeded: false,
    asNeededCondition: '',
    startDate: '2021-09-07T19:24:32.904Z',
    duration: null,
    durationUnit: {
      uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Days',
    },
    pillsDispensed: 0,
    numRefills: 0,
    freeTextDosage: '',
    indication: '',
  },
  {
    action: 'NEW',
    drug: {
      uuid: '18f43c99-2329-426e-97b5-c3356e6afe54',
      name: 'Aspirin',
      display: 'Aspirin',
      strength: '243mg',
      dosageForm: {
        display: 'Tablet',
        uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      concept: {
        uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Aspirin',
        name: {
          display: 'Aspirin',
          uuid: '124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          name: 'Aspirin',
          locale: 'en',
          localePreferred: true,
          conceptNameType: null,
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            },
            {
              rel: 'full',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
            },
          ],
          resourceVersion: '1.9',
        },
        datatype: {
          uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
          display: 'N/A',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
            },
          ],
        },
        conceptClass: {
          uuid: '8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
          display: 'Drug',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptclass/8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
            },
          ],
        },
        set: false,
        version: null,
        retired: false,
        descriptions: [
          {
            uuid: '2729FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            display: 'dawa ya kupunguza maumivu',
          },
          {
            uuid: '16090FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            display: 'Name of a drug which is used as anti inflammatory and analgesic',
            links: [
              {
                rel: 'self',
                uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16090FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
              },
            ],
          },
        ],
        answers: [],
        setMembers: [],
        attributes: [],
        links: [
          {
            rel: 'self',
            uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
          {
            rel: 'full',
            uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
          },
        ],
        resourceVersion: '2.0',
      },
    },
    dosage: {
      value: 243,
    },
    unit: {
      valueCoded: '3013AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      value: 'mg',
    },
    dosageUnit: {
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      name: 'Tablet',
      selected: true,
    },
    frequency: {
      value: 'Once daily',
      valueCoded: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    route: {
      value: 'Oral',
      valueCoded: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    encounterUuid: '8450ae45-8702-4edd-9541-4f9a75263eab',
    commonMedicationName: 'Aspirin',
    isFreeTextDosage: false,
    patientInstructions: '',
    asNeeded: false,
    asNeededCondition: '',
    startDate: '2021-09-07T19:24:32.904Z',
    duration: null,
    durationUnit: {
      uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Days',
    },
    pillsDispensed: 0,
    numRefills: 0,
    freeTextDosage: '',
    indication: '',
  },
];

export const mockDrugOrders = {
  data: {
    results: [
      {
        uuid: '1a80e53c-2c66-4027-9b01-a1e88e9f153d',
        dosingType: 'org.openmrs.SimpleDosingInstructions',
        orderNumber: 'ORD-381',
        accessionNumber: null,
        patient: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        action: 'NEW',
        careSetting: {
          uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
          display: 'Outpatient',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
            },
          ],
        },
        previousOrder: null,
        dateActivated: '2021-09-09T13:12:10.000+0000',
        scheduledDate: null,
        dateStopped: null,
        autoExpireDate: null,
        orderType: {
          uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7',
          display: 'Drug Order',
          name: 'Drug Order',
          javaClassName: 'org.openmrs.DrugOrder',
          retired: false,
          description: 'An order for a medication to be given to the patient',
          conceptClasses: [],
          parent: null,
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7',
            },
            {
              rel: 'full',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7?v=full',
            },
          ],
          resourceVersion: '1.10',
        },
        encounter: {
          uuid: 'd3bd542d-be6e-4d8b-939e-24d25b5490c2',
          display: 'Admission 08/09/2021',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/encounter/d3bd542d-be6e-4d8b-939e-24d25b5490c2',
            },
          ],
        },
        orderer: {
          uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
          display: 'ghvbjnkm-1 - Fifty User',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/provider/e89cae4a-3cb3-40a2-b964-8b20dda2c985',
            },
          ],
        },
        orderReason: null,
        orderReasonNonCoded: null,
        urgency: 'ROUTINE',
        instructions: null,
        commentToFulfiller: null,
        drug: {
          uuid: '18f43c99-2329-426e-97b5-c3356e6afe54',
          display: 'Aspirin',
          strength: '81mg',
          dosageForm: {
            display: 'Tablet',
            uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
          concept: {
            uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Aspirin',
            name: {
              display: 'Aspirin',
              uuid: '124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              name: 'Aspirin',
              locale: 'en',
              localePreferred: true,
              conceptNameType: null,
              links: [
                {
                  rel: 'self',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                },
                {
                  rel: 'full',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
                },
              ],
              resourceVersion: '1.9',
            },
            datatype: {
              uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
              display: 'N/A',
              links: [
                {
                  rel: 'self',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                },
              ],
            },
            conceptClass: {
              uuid: '8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
              display: 'Drug',
              links: [
                {
                  rel: 'self',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptclass/8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
                },
              ],
            },
            set: false,
            version: null,
            retired: false,
            answers: [],
            setMembers: [],
            attributes: [],
            resourceVersion: '2.0',
          },
        },
        dose: 1,
        doseUnits: {
          uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Tablet',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        frequency: {
          uuid: '160862OFAAAAAAAAAAAAAAA',
          display: 'Once daily',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/orderfrequency/160862OFAAAAAAAAAAAAAAA',
            },
          ],
        },
        asNeeded: false,
        asNeededCondition: null,
        quantity: 0,
        quantityUnits: {
          uuid: '162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Box',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        numRefills: 0,
        dosingInstructions: null,
        duration: null,
        durationUnits: {
          uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Days',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        route: {
          uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Oral',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        brandName: null,
        dispenseAsWritten: false,
      },
      {
        uuid: 'a49580a8-6c41-4389-8278-c27821b487bb',
        dosingType: 'org.openmrs.SimpleDosingInstructions',
        orderNumber: 'ORD-382',
        accessionNumber: null,
        patient: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        action: 'NEW',
        careSetting: {
          uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
          display: 'Outpatient',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
            },
          ],
        },
        previousOrder: null,
        dateActivated: '2021-09-09T13:14:03.000+0000',
        scheduledDate: null,
        dateStopped: null,
        autoExpireDate: null,
        orderType: {
          uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7',
          display: 'Drug Order',
          name: 'Drug Order',
          javaClassName: 'org.openmrs.DrugOrder',
          retired: false,
          description: 'An order for a medication to be given to the patient',
          conceptClasses: [],
          parent: null,
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7',
            },
            {
              rel: 'full',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7?v=full',
            },
          ],
          resourceVersion: '1.10',
        },
        encounter: {
          uuid: 'd3bd542d-be6e-4d8b-939e-24d25b5490c2',
          display: 'Admission 08/09/2021',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/encounter/d3bd542d-be6e-4d8b-939e-24d25b5490c2',
            },
          ],
        },
        orderer: {
          uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
          display: 'ghvbjnkm-1 - Fifty User',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/provider/e89cae4a-3cb3-40a2-b964-8b20dda2c985',
            },
          ],
        },
        orderReason: null,
        orderReasonNonCoded: null,
        urgency: 'ROUTINE',
        instructions: null,
        commentToFulfiller: null,
        drug: {
          uuid: '9152d395-e821-47f0-b15c-588808585350',
          display: 'efavirenz',
          strength: '600mg',
          dosageForm: {
            display: 'Tablet',
            uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
          concept: {
            uuid: '75523AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'EFAVIRENZ',
            name: {
              display: 'EFAVIRENZ',
              uuid: '5290BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              name: 'EFAVIRENZ',
              locale: 'en',
              localePreferred: true,
              conceptNameType: 'FULLY_SPECIFIED',
              resourceVersion: '1.9',
            },
            datatype: {
              uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
              display: 'N/A',
              links: [
                {
                  rel: 'self',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                },
              ],
            },
            conceptClass: {
              uuid: '8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
              display: 'Drug',
              links: [
                {
                  rel: 'self',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptclass/8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
                },
              ],
            },
            set: false,
            version: null,
            retired: false,
            answers: [],
            setMembers: [],
            attributes: [],
            links: [
              {
                rel: 'self',
                uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/75523AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              },
              {
                rel: 'full',
                uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/75523AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
              },
            ],
            resourceVersion: '2.0',
          },
        },
        dose: 1,
        doseUnits: {
          uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Tablet',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        frequency: {
          uuid: '160862OFAAAAAAAAAAAAAAA',
          display: 'Once daily',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/orderfrequency/160862OFAAAAAAAAAAAAAAA',
            },
          ],
        },
        asNeeded: false,
        asNeededCondition: null,
        quantity: 0,
        quantityUnits: {
          uuid: '162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Box',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        numRefills: 0,
        dosingInstructions: null,
        duration: null,
        durationUnits: {
          uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Days',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        route: {
          uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Oral',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        brandName: null,
        dispenseAsWritten: false,
      },
      {
        uuid: '2bdfb49e-8af6-4e97-a96c-f62eb9952bba',
        dosingType: 'org.openmrs.SimpleDosingInstructions',
        orderNumber: 'ORD-396',
        accessionNumber: null,
        patient: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        action: 'REVISE',
        careSetting: {
          uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
          display: 'Outpatient',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
            },
          ],
        },
        previousOrder: {
          uuid: 'e4c565cf-b9ee-4fbd-adce-6e188444f71f',
          display: '(NEW) sulfadoxine: 1.0 Tablet Oral Once daily 5 Days',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/order/e4c565cf-b9ee-4fbd-adce-6e188444f71f',
            },
          ],
          type: 'drugorder',
        },
        dateActivated: '2021-09-10T22:14:11.000+0000',
        scheduledDate: null,
        dateStopped: null,
        autoExpireDate: null,
        orderType: {
          uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7',
          display: 'Drug Order',
          name: 'Drug Order',
          javaClassName: 'org.openmrs.DrugOrder',
          retired: false,
          description: 'An order for a medication to be given to the patient',
          conceptClasses: [],
          parent: null,
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7',
            },
            {
              rel: 'full',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7?v=full',
            },
          ],
          resourceVersion: '1.10',
        },
        encounter: {
          uuid: 'd3bd542d-be6e-4d8b-939e-24d25b5490c2',
          display: 'Admission 08/09/2021',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/encounter/d3bd542d-be6e-4d8b-939e-24d25b5490c2',
            },
          ],
        },
        orderer: {
          uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
          display: 'ghvbjnkm-1 - Fifty User',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/provider/e89cae4a-3cb3-40a2-b964-8b20dda2c985',
            },
          ],
        },
        orderReason: null,
        orderReasonNonCoded: 'Malaria',
        urgency: 'ROUTINE',
        instructions: null,
        commentToFulfiller: null,
        drug: {
          uuid: 'fc92c351-8a85-41b9-95bf-a7dfea46c9cd',
          name: 'sulfadoxine',
          strength: '500mg',
          dosageForm: {
            display: 'Capsule',
            uuid: '1608AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
          concept: {
            uuid: '84462AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'SULFADOXINE',
            name: {
              display: 'SULFADOXINE',
              uuid: '8155BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              name: 'SULFADOXINE',
              locale: 'en',
              localePreferred: true,
              conceptNameType: 'FULLY_SPECIFIED',
              links: [
                {
                  rel: 'self',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/84462AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/8155BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                },
                {
                  rel: 'full',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/84462AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/8155BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
                },
              ],
              resourceVersion: '1.9',
            },
            datatype: {
              uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
              display: 'N/A',
              links: [
                {
                  rel: 'self',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                },
              ],
            },
            conceptClass: {
              uuid: '8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
              display: 'Drug',
              links: [
                {
                  rel: 'self',
                  uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/conceptclass/8d490dfc-c2cc-11de-8d13-0010c6dffd0f',
                },
              ],
            },
            set: false,
            version: null,
            retired: false,
            names: [
              {
                uuid: '8155BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                display: 'SULFADOXINE',
                links: [
                  {
                    rel: 'self',
                    uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/84462AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/8155BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                ],
              },
            ],
            descriptions: [],
            answers: [],
            setMembers: [],
            attributes: [],
            links: [
              {
                rel: 'self',
                uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/84462AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              },
              {
                rel: 'full',
                uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/84462AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
              },
            ],
            resourceVersion: '2.0',
          },
        },
        dose: 1,
        doseUnits: {
          uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Tablet',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        frequency: {
          uuid: '160862OFAAAAAAAAAAAAAAA',
          display: 'Once daily',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/orderfrequency/160862OFAAAAAAAAAAAAAAA',
            },
          ],
        },
        asNeeded: false,
        asNeededCondition: null,
        quantity: 3,
        quantityUnits: {
          uuid: '162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Box',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        numRefills: 2,
        dosingInstructions: null,
        duration: 5,
        durationUnits: {
          uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Days',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        route: {
          uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Oral',
          links: [
            {
              rel: 'self',
              uri: 'https://openmrs-spa.org/openmrs/ws/rest/v1/concept/160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        brandName: null,
        dispenseAsWritten: false,
      },
    ],
  },
};
