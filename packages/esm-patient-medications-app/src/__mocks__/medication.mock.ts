export const patientUuid = '8673ee4f-e2ab-4077-ba55-4980f408773e';

export const mockDrugSearchResultApiData = [
  {
    uuid: '09e58895-e7f0-4649-b7c0-e665c5c08e93',
    display: 'Aspirin 81mg',
    name: 'Aspirin 81mg',
    strength: '81mg',
    dosageForm: {
      display: 'Tablet',
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    concept: {
      display: 'Aspirin',
      uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  {
    uuid: 'a722710f-403b-451f-804b-09f8624b0838',
    display: 'Aspirin 162.5mg',
    name: 'Aspirin 162.5mg',
    strength: '162.5mg',
    dosageForm: {
      display: 'Tablet',
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    concept: {
      display: 'Aspirin',
      uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  {
    uuid: '38087db3-7395-431f-88d5-bb25e06e33f1',
    display: 'Aspirin 325mg',
    name: 'Aspirin 325mg',
    strength: '325mg',
    dosageForm: {
      display: 'Tablet',
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    concept: {
      display: 'Aspirin',
      uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
];

export const mockDrugOrderTemplateApiData = {
  '09e58895-e7f0-4649-b7c0-e665c5c08e93': [
    {
      uuid: '270527a4-4cd9-4a84-8a11-f86e3d89f885',
      display: 'Asprin 81mg template',
      name: 'Asprin 81mg template',
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
      },
      concept: {
        uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Aspirin',
      },
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
      },
      concept: {
        uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Aspirin',
      },
    },
  ],
};

export const mockPatientDrugOrdersApiData = [
  {
    uuid: '819edce3-c5e7-4342-aeba-7e406f639699',
    dosingType: 'org.openmrs.SimpleDosingInstructions',
    orderNumber: 'ORD-814',
    patient: {
      uuid: patientUuid,
      display: '1003Y2M - John172 Smith9591',
    },
    action: 'NEW',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      display: 'Outpatient',
    },
    dateActivated: '2023-08-14T18:23:05.000+0000',
    autoExpireDate: '2023-09-13T18:23:04.000+0000',
    orderType: {
      uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7',
      display: 'Drug Order',
      name: 'Drug Order',
      javaClassName: 'org.openmrs.DrugOrder',
      retired: false,
      description: 'An order for a medication to be given to the patient',
      resourceVersion: '1.10',
    },
    encounter: {
      uuid: 'e9337310-ae96-416a-8469-6ab4d3f2f10f',
      display: 'Vitals 08/06/2023',
    },
    orderer: {
      uuid: '165d2b80-c55e-4146-8a3e-56f27e5d1e4d',
      display: 'admin - Admin User',
      person: { display: 'Admin User' },
    },
    orderReasonNonCoded: 'Heart',
    urgency: 'ROUTINE',
    drug: {
      uuid: 'a722710f-403b-451f-804b-09f8624b0838',
      display: 'Aspirin 162.5mg',
      strength: '162.5mg',
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
        retired: false,
        names: {
          uuid: '124912BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Aspirin',
        },
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
        resourceVersion: '2.0',
      },
    },
    dose: 1,
    doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
    frequency: {
      uuid: '136ebdb7-e989-47cf-8ec2-4e8b2ffe0ab3',
      display: 'Once daily',
    },
    asNeeded: false,
    quantity: 30,
    quantityUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
    numRefills: 0,
    duration: 30,
    durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
    route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
    dispenseAsWritten: false,
  },
  {
    uuid: '3ac6eb78-d7ff-4eaa-b86e-b8c0c0af7c27',
    dosingType: 'org.openmrs.FreeTextDosingInstructions',
    orderNumber: 'ORD-815',
    patient: {
      uuid: patientUuid,
      display: '1003Y2M - John172 Smith9591',
    },
    action: 'NEW',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      display: 'Outpatient',
    },
    dateActivated: '2023-08-14T18:23:05.000+0000',
    autoExpireDate: '2023-08-21T18:23:04.000+0000',
    orderType: {
      uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7',
      display: 'Drug Order',
      name: 'Drug Order',
      javaClassName: 'org.openmrs.DrugOrder',
      retired: false,
      description: 'An order for a medication to be given to the patient',
      resourceVersion: '1.10',
    },
    encounter: {
      uuid: 'e9337310-ae96-416a-8469-6ab4d3f2f10f',
      display: 'Vitals 08/06/2023',
    },
    orderer: {
      uuid: '165d2b80-c55e-4146-8a3e-56f27e5d1e4d',
      display: 'admin - Admin User',
      person: { display: 'Admin User' },
    },
    orderReasonNonCoded: 'Pain',
    urgency: 'ROUTINE',
    drug: {
      uuid: '88b343c0-a9e9-4b45-b57e-cc7014ab7f34',
      display: 'Sulfacetamide 0.1',
      strength: '10%',
      concept: {
        uuid: '516e7c1e-9019-4c19-a853-862e4a8fd8c1',
        display: 'Sulfacetamide',
        name: {
          display: 'Sulfacetamide',
          uuid: 'f276ccd1-db66-3901-b083-ea72ba7b308c',
          name: 'Sulfacetamide',
          locale: 'en',
          localePreferred: true,
          conceptNameType: 'FULLY_SPECIFIED',
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
        retired: false,
        names: {
          uuid: 'a53c57f7-7728-3422-90a4-d9c0e08962a3',
          display: 'Sulfacetamide',
        },
        resourceVersion: '2.0',
      },
    },
    dose: 1,
    doseUnits: {
      uuid: '162376AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Application',
    },
    asNeeded: false,
    quantity: 8,
    quantityUnits: {
      uuid: '162376AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Application',
    },
    numRefills: 1,
    dosingInstructions: 'Apply it',
    duration: 1,
    durationUnits: { uuid: '1073AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Weeks' },
    dispenseAsWritten: false,
  },
  {
    uuid: '203b805b-b868-4936-b87d-55d1e3132261',
    dosingType: 'org.openmrs.SimpleDosingInstructions',
    orderNumber: 'ORD-816',
    patient: {
      uuid: patientUuid,
      display: '1003Y2M - John172 Smith9591',
    },
    action: 'NEW',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      display: 'Outpatient',
    },
    dateActivated: '2023-08-14T18:23:06.000+0000',
    dateStopped: '2023-08-14T18:24:01.000+0000',
    orderType: {
      uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7',
      display: 'Drug Order',
      name: 'Drug Order',
      javaClassName: 'org.openmrs.DrugOrder',
      retired: false,
      description: 'An order for a medication to be given to the patient',
      resourceVersion: '1.10',
    },
    encounter: {
      uuid: 'e9337310-ae96-416a-8469-6ab4d3f2f10f',
      display: 'Vitals 08/06/2023',
    },
    orderer: {
      uuid: '165d2b80-c55e-4146-8a3e-56f27e5d1e4d',
      display: 'admin - Admin User',
      person: { display: 'Admin User' },
    },
    orderReasonNonCoded: 'No good',
    urgency: 'ROUTINE',
    drug: {
      uuid: 'dfd36a48-1946-454c-bc04-8dc7cada7120',
      display: 'Acetaminophen 325 mg',
      strength: '325mg',
      dosageForm: {
        display: 'Tablet',
        uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      concept: {
        uuid: '70116AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Acetaminophen',
        name: {
          display: 'Acetaminophen',
          uuid: '3294BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          name: 'Acetaminophen',
          locale: 'en',
          localePreferred: true,
          conceptNameType: 'FULLY_SPECIFIED',
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
        retired: false,
        names: {
          uuid: '131353BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Acetaminophen',
        },
        mappings: [
          {
            uuid: '134241ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            display: 'AMPATH: 453',
          },
          {
            uuid: '12ad5a35-9919-32db-9c8c-57aa28de0a62',
            display: 'CIEL: 70116',
          },
          {
            uuid: '144216ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            display: 'AMPATH: 89',
          },
          {
            uuid: '126890ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            display: 'RxNORM: 161',
          },
          {
            uuid: '138254ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            display: 'SNOMED CT: 90332006',
          },
        ],
        resourceVersion: '2.0',
      },
    },
    dose: 2,
    doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
    frequency: {
      uuid: '08c71152-c552-42e7-b094-f510ff44e9cb',
      display: 'Twice daily',
    },
    asNeeded: true,
    asNeededCondition: 'Bad times',
    quantity: 0,
    quantityUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
    numRefills: 0,
    durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
    route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
    dispenseAsWritten: false,
  },
  {
    uuid: '451021e0-73aa-4d17-adcb-22d75b6244dc',
    dosingType: 'org.openmrs.FreeTextDosingInstructions',
    orderNumber: 'ORD-817',
    patient: {
      uuid: patientUuid,
      display: '1003Y2M - John172 Smith9591',
    },
    action: 'REVISE',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      display: 'Outpatient',
    },
    previousOrder: {
      uuid: '203b805b-b868-4936-b87d-55d1e3132261',
      display: '(NEW) Acetaminophen 325 mg: 2.0 Tablet Oral Twice daily PRN Bad times',
      type: 'drugorder',
    },
    dateActivated: '2023-08-14T18:24:02.000+0000',
    orderType: {
      uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7',
      display: 'Drug Order',
      name: 'Drug Order',
      javaClassName: 'org.openmrs.DrugOrder',
      retired: false,
      description: 'An order for a medication to be given to the patient',
      resourceVersion: '1.10',
    },
    encounter: {
      uuid: 'e9337310-ae96-416a-8469-6ab4d3f2f10f',
      display: 'Vitals 08/06/2023',
    },
    orderer: {
      uuid: '165d2b80-c55e-4146-8a3e-56f27e5d1e4d',
      display: 'admin - Admin User',
      person: { display: 'Admin User' },
    },
    orderReasonNonCoded: 'Bad boo-boo',
    urgency: 'ROUTINE',
    drug: {
      uuid: 'dfd36a48-1946-454c-bc04-8dc7cada7120',
      display: 'Acetaminophen 325 mg',
      strength: '325mg',
      dosageForm: {
        display: 'Tablet',
        uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      concept: {
        uuid: '70116AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Acetaminophen',
        name: {
          display: 'Acetaminophen',
          uuid: '3294BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          name: 'Acetaminophen',
          locale: 'en',
          localePreferred: true,
          conceptNameType: 'FULLY_SPECIFIED',
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
        retired: false,
        names: {
          uuid: '131353BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Acetaminophen',
        },
        mappings: [
          {
            uuid: '134241ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            display: 'AMPATH: 453',
          },
          {
            uuid: '12ad5a35-9919-32db-9c8c-57aa28de0a62',
            display: 'CIEL: 70116',
          },
          {
            uuid: '144216ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            display: 'AMPATH: 89',
          },
          {
            uuid: '126890ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            display: 'RxNORM: 161',
          },
          {
            uuid: '138254ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            display: 'SNOMED CT: 90332006',
          },
        ],
        resourceVersion: '2.0',
      },
    },
    dose: 2,
    doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
    frequency: {
      uuid: '08c71152-c552-42e7-b094-f510ff44e9cb',
      display: 'Twice daily',
    },
    asNeeded: true,
    asNeededCondition: "It's ok",
    quantity: 0,
    quantityUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
    numRefills: 0,
    dosingInstructions: 'Take it sometimes',
    durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
    route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
    dispenseAsWritten: false,
  },
];
