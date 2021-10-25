export const mockDrugSearchResults = {
  data: {
    results: [
      {
        uuid: '18f43c99-2329-426e-97b5-c3356e6afe54',
        name: 'aspirin',
        strength: '81mg',
        dosageForm: {
          display: 'Tablet',
          uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
        concept: {
          uuid: '1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
      },
    ],
  },
};
export const mockDurationUnitsResults = {
  data: {
    answers: [
      { uuid: '1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Months' },
      { uuid: '1073AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Weeks' },
      { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
      { uuid: '1734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Years' },
      { uuid: '1733AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Minutes' },
      { uuid: '1822AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Hours' },
      {
        uuid: '162582AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Number of occurrences',
      },
      { uuid: '162583AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Seconds' },
    ],
  },
};

export const mockPatientEncounterIDResults = {
  data: {
    results: [{ uuid: '0926163e-8a28-43c2-a2cf-9851dc72f39d' }],
  },
};

export const mockMedicationOrderByUuidResponse = {
  data: [
    {
      uuid: '42b8fe2f-8c55-45a2-8e40-cb0b8100de7c',
      route: {
        uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Oral',
      },
      action: 'REVISE',
      urgency: 'ROUTINE',
      display: '(REVISE) sulfadoxine: 2.0 Capsule Oral Once daily 5 Days dosing',
      drug: {
        display: 'sulfadoxine',
        strength: '500mg',
      },
      frequency: {
        display: 'Once daily',
      },
      dose: 2.0,
      doseUnits: {
        display: 'Capsule',
      },
      orderer: {
        uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
        display: 'ghvbjnkm-1 - Fifty User',
        person: {
          uuid: 'e7dd932e-c2ac-4917-bf66-e59793adbd5f',
          display: 'Fifty User',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/person/e7dd932e-c2ac-4917-bf66-e59793adbd5f',
            },
          ],
        },
        identifier: 'ghvbjnkm-1',
        attributes: [],
        retired: false,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrs/ws/rest/v1/provider/e89cae4a-3cb3-40a2-b964-8b20dda2c985',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrs/ws/rest/v1/provider/e89cae4a-3cb3-40a2-b964-8b20dda2c985?v=full',
          },
        ],
        resourceVersion: '1.9',
      },
      dateStopped: null,
      dateActivated: '2020-02-19T14:16:17.000+0000',
      previousOrder: {
        uuid: '0d46ad72-9d94-41f7-92cf-0a568cfff357',
        orderNumber: 'ORD-142',
        accessionNumber: null,
        patient: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        concept: {
          uuid: '84462AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'SULFADOXINE',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/concept/84462AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
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
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
            },
          ],
        },
        previousOrder: null,
        dateActivated: '2020-02-19T14:15:47.000+0000',
        scheduledDate: null,
        dateStopped: '2020-02-19T14:16:16.000+0000',
        autoExpireDate: null,
        encounter: {
          uuid: '11c22e25-f9f8-4c79-b384-1da39ee7d5d2',
          display: 'Visit Note 10/11/2016',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/encounter/11c22e25-f9f8-4c79-b384-1da39ee7d5d2',
            },
          ],
        },
        orderer: {
          uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
          display: 'ghvbjnkm-1 - Fifty User',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/provider/e89cae4a-3cb3-40a2-b964-8b20dda2c985',
            },
          ],
        },
        orderReason: null,
        orderReasonNonCoded: null,
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
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7',
            },
            {
              rel: 'full',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7?v=full',
            },
          ],
          resourceVersion: '1.10',
        },
        urgency: 'ROUTINE',
        instructions: null,
        commentToFulfiller: null,
        display: '(NEW) sulfadoxine: 1.0 Capsule Oral Once daily 5 Days dosing',
        drug: {
          uuid: 'fc92c351-8a85-41b9-95bf-a7dfea46c9cd',
          display: 'sulfadoxine',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/drug/fc92c351-8a85-41b9-95bf-a7dfea46c9cd',
            },
          ],
        },
        dosingType: 'org.openmrs.SimpleDosingInstructions',
        dose: 1.0,
        doseUnits: {
          uuid: '1608AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Capsule',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/concept/1608AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        frequency: {
          uuid: '160862OFAAAAAAAAAAAAAAA',
          display: 'Once daily',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/orderfrequency/160862OFAAAAAAAAAAAAAAA',
            },
          ],
        },
        asNeeded: false,
        asNeededCondition: null,
        quantity: 1.0,
        quantityUnits: {
          uuid: '162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Box',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/concept/162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        numRefills: 5,
        dosingInstructions: 'dosing',
        duration: 5,
        durationUnits: {
          uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Days',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        route: {
          uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Oral',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/concept/160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        brandName: null,
        dispenseAsWritten: false,
        drugNonCoded: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrs/ws/rest/v1/order/0d46ad72-9d94-41f7-92cf-0a568cfff357',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrs/ws/rest/v1/order/0d46ad72-9d94-41f7-92cf-0a568cfff357?v=full',
          },
        ],
        type: 'drugorder',
        resourceVersion: '1.10',
      },
      numRefills: 5,
      duration: 5,
      durationUnits: {
        display: 'Days',
      },
      type: 'drugorder',
    },
  ],
};

export const mockMedicationOrderSearchResults = [
  {
    action: 'NEW',
    drug: {
      uuid: '18f43c99-2329-426e-97b5-c3356e6afe54',
      name: 'aspirin',
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
    dosage: {
      dosage: '81 mg',
      numberOfPills: 1,
    },
    dosageUnit: {
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      name: 'Tablet',
      selected: true,
    },
    frequency: {
      name: 'Once daily',
      conceptUuid: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      selected: true,
    },
    route: {
      name: 'Oral',
      conceptUuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      selected: true,
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
      name: 'aspirin',
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
      dosage: '162 mg',
      numberOfPills: 2,
    },
    dosageUnit: {
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      name: 'Tablet',
      selected: true,
    },
    frequency: {
      name: 'Once daily',
      conceptUuid: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      selected: true,
    },
    route: {
      name: 'Oral',
      conceptUuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      selected: true,
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
      name: 'aspirin',
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
      dosage: '243 mg',
      numberOfPills: 3,
      selected: true,
    },
    dosageUnit: {
      uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      name: 'Tablet',
      selected: true,
    },
    frequency: {
      name: 'Once daily',
      conceptUuid: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      selected: true,
    },
    route: {
      name: 'Oral',
      conceptUuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      selected: true,
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
          name: 'aspirin',
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
          name: 'efavirenz',
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
