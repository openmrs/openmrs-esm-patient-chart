export const mockOrders = [
  {
    uuid: '6709526b-878f-4d8c-8554-f51a8d1b218e',
    orderNumber: 'ORD-321',
    accessionNumber: null,
    patient: {
      uuid: 'ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
      display: '100014M - Daniel Scott',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/patient/ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
          resourceAlias: 'patient',
        },
      ],
    },
    concept: {
      uuid: '6315c226-01f6-4c59-9332-74f5347c3ef7',
      display: 'Permethrin',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/6315c226-01f6-4c59-9332-74f5347c3ef7',
          resourceAlias: 'concept',
        },
      ],
    },
    action: 'NEW',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      name: 'Outpatient',
      description: 'Out-patient care setting',
      retired: false,
      careSettingType: 'OUTPATIENT',
      display: 'Outpatient',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
          resourceAlias: 'caresetting',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0?v=full',
          resourceAlias: 'caresetting',
        },
      ],
      resourceVersion: '1.10',
    },
    previousOrder: null,
    dateActivated: '2024-11-22T05:40:29.000+0000',
    scheduledDate: null,
    dateStopped: null,
    autoExpireDate: '2024-11-23T05:40:28.000+0000',
    encounter: {
      uuid: 'f7aa3e36-9aed-421b-acf4-f3b6af71cca8',
      display: 'Order 11/21/2024',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/encounter/f7aa3e36-9aed-421b-acf4-f3b6af71cca8',
          resourceAlias: 'encounter',
        },
      ],
    },
    orderer: {
      uuid: 'bc445775-b8a6-4379-83b4-0338bfa32e1d',
      display: 'admin - Super User',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/provider/bc445775-b8a6-4379-83b4-0338bfa32e1d',
          resourceAlias: 'provider',
        },
      ],
    },
    orderReason: null,
    orderReasonNonCoded: 'hyper tension',
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
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7',
          resourceAlias: 'ordertype',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/131168f4-15f5-102d-96e4-000c29c2a5d7?v=full',
          resourceAlias: 'ordertype',
        },
      ],
      resourceVersion: '1.10',
    },
    urgency: 'ROUTINE',
    instructions: null,
    commentToFulfiller: null,
    display: '(NEW) Permethrin: 1.0 Ampule(s) Oral Once daily 1 Days take after eating',
    auditInfo: {
      creator: {
        uuid: '82f18b44-6814-11e8-923f-e9a88dcb533f',
        display: 'admin',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/user/82f18b44-6814-11e8-923f-e9a88dcb533f',
            resourceAlias: 'user',
          },
        ],
      },
      dateCreated: '2024-11-22T05:40:29.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    fulfillerStatus: null,
    fulfillerComment: null,
    drug: {
      uuid: '637499ff-1c54-4722-ba57-3e41b3d22a49',
      display: 'Permethrin',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/drug/637499ff-1c54-4722-ba57-3e41b3d22a49',
          resourceAlias: 'drug',
        },
      ],
    },
    dosingType: 'org.openmrs.SimpleDosingInstructions',
    dose: 1,
    doseUnits: {
      uuid: '162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Ampule(s)',
      name: {
        display: 'Ampule(s)',
        uuid: '125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        name: 'Ampule(s)',
        locale: 'en',
        localePreferred: true,
        conceptNameType: 'FULLY_SPECIFIED',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            resourceAlias: 'name',
          },
          {
            rel: 'full',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
            resourceAlias: 'name',
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
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
            resourceAlias: 'conceptdatatype',
          },
        ],
      },
      conceptClass: {
        uuid: 'e30d8601-07f8-413a-9d11-cdfbb28196ec',
        display: 'Units of Measure',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/conceptclass/e30d8601-07f8-413a-9d11-cdfbb28196ec',
            resourceAlias: 'conceptclass',
          },
        ],
      },
      set: false,
      version: null,
      retired: false,
      names: [
        {
          uuid: '147393BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Ampoule(s)',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/147393BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Ampule(s)',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '125518BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Ampule',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125518BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '125517BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Amp',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125517BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
      ],
      descriptions: [
        {
          uuid: '17206FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          display: 'A unit for dosing medications.',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/17206FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
              resourceAlias: 'description',
            },
          ],
        },
      ],
      mappings: [
        {
          uuid: '8e7174b5-2504-3a00-9261-ee477a630bd9',
          display: 'CIEL: 162335',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/8e7174b5-2504-3a00-9261-ee477a630bd9',
              resourceAlias: 'mapping',
            },
          ],
        },
        {
          uuid: '275217ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'SNOMED CT: 413516001',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/275217ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'mapping',
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
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          resourceAlias: 'concept',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
          resourceAlias: 'concept',
        },
      ],
      resourceVersion: '2.0',
    },
    frequency: {
      uuid: '136ebdb7-e989-47cf-8ec2-4e8b2ffe0ab3',
      display: 'Once daily',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/orderfrequency/136ebdb7-e989-47cf-8ec2-4e8b2ffe0ab3',
          resourceAlias: 'orderfrequency',
        },
      ],
    },
    asNeeded: false,
    asNeededCondition: null,
    quantity: 1,
    quantityUnits: {
      uuid: '162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Ampule(s)',
      name: {
        display: 'Ampule(s)',
        uuid: '125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        name: 'Ampule(s)',
        locale: 'en',
        localePreferred: true,
        conceptNameType: 'FULLY_SPECIFIED',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            resourceAlias: 'name',
          },
          {
            rel: 'full',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
            resourceAlias: 'name',
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
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
            resourceAlias: 'conceptdatatype',
          },
        ],
      },
      conceptClass: {
        uuid: 'e30d8601-07f8-413a-9d11-cdfbb28196ec',
        display: 'Units of Measure',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/conceptclass/e30d8601-07f8-413a-9d11-cdfbb28196ec',
            resourceAlias: 'conceptclass',
          },
        ],
      },
      set: false,
      version: null,
      retired: false,
      names: [
        {
          uuid: '147393BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Ampoule(s)',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/147393BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Ampule(s)',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125519BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '125518BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Ampule',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125518BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '125517BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Amp',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/125517BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
      ],
      descriptions: [
        {
          uuid: '17206FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          display: 'A unit for dosing medications.',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/17206FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
              resourceAlias: 'description',
            },
          ],
        },
      ],
      mappings: [
        {
          uuid: '8e7174b5-2504-3a00-9261-ee477a630bd9',
          display: 'CIEL: 162335',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/8e7174b5-2504-3a00-9261-ee477a630bd9',
              resourceAlias: 'mapping',
            },
          ],
        },
        {
          uuid: '275217ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'SNOMED CT: 413516001',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/275217ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'mapping',
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
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          resourceAlias: 'concept',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
          resourceAlias: 'concept',
        },
      ],
      resourceVersion: '2.0',
    },
    numRefills: 1,
    dosingInstructions: 'take after eating',
    duration: 1,
    durationUnits: {
      uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Days',
      name: {
        display: 'Days',
        uuid: '1146BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        name: 'Days',
        locale: 'en',
        localePreferred: true,
        conceptNameType: 'FULLY_SPECIFIED',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1146BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
            resourceAlias: 'name',
          },
          {
            rel: 'full',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1146BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
            resourceAlias: 'name',
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
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
            resourceAlias: 'conceptdatatype',
          },
        ],
      },
      conceptClass: {
        uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
        display: 'Misc',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
            resourceAlias: 'conceptclass',
          },
        ],
      },
      set: false,
      version: null,
      retired: false,
      names: [
        {
          uuid: '136081BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Jou',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/136081BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '136080BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Jours',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/136080BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '123591BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Dias',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/123591BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
        {
          uuid: '1146BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'Days',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1146BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'name',
            },
          ],
        },
      ],
      descriptions: [
        {
          uuid: '1075FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          display: 'Generic temporal answer to question.',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/1075FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
              resourceAlias: 'description',
            },
          ],
        },
      ],
      mappings: [
        {
          uuid: '133845ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'SNOMED CT: 258703001',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/133845ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'mapping',
            },
          ],
        },
        {
          uuid: '171335ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'CIEL: 1072',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/171335ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'mapping',
            },
          ],
        },
        {
          uuid: '291090ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'UCUM: d',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/291090ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'mapping',
            },
          ],
        },
        {
          uuid: '134744ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          display: 'AMPATH: 1072',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/134744ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              resourceAlias: 'mapping',
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
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          resourceAlias: 'concept',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
          resourceAlias: 'concept',
        },
      ],
      resourceVersion: '2.0',
    },
    route: {
      uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Oral',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          resourceAlias: 'concept',
        },
      ],
    },
    brandName: null,
    dispenseAsWritten: false,
    drugNonCoded: null,
    links: [
      {
        rel: 'self',
        uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/order/6709526b-878f-4d8c-8554-f51a8d1b218e',
        resourceAlias: 'order',
      },
    ],
    type: 'drugorder',
    resourceVersion: '1.10',
  },
  {
    uuid: '4da57fd0-bd0c-4d23-8119-c70fc7e99840',
    orderNumber: 'ORD-197',
    accessionNumber: null,
    patient: {
      uuid: 'ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
      display: '100014M - Daniel Scott',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/patient/ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
          resourceAlias: 'patient',
        },
      ],
    },
    concept: {
      uuid: '1134AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Serum chloride',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1134AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          resourceAlias: 'concept',
        },
      ],
    },
    action: 'NEW',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      name: 'Outpatient',
      description: 'Out-patient care setting',
      retired: false,
      careSettingType: 'OUTPATIENT',
      display: 'Outpatient',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
          resourceAlias: 'caresetting',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0?v=full',
          resourceAlias: 'caresetting',
        },
      ],
      resourceVersion: '1.10',
    },
    previousOrder: null,
    dateActivated: '2022-11-20T21:52:55.000+0000',
    scheduledDate: null,
    dateStopped: null,
    autoExpireDate: null,
    encounter: {
      uuid: '9468dc74-3b4c-4db9-b782-2a05df88e099',
      display: 'Order 11/20/2022',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/encounter/9468dc74-3b4c-4db9-b782-2a05df88e099',
          resourceAlias: 'encounter',
        },
      ],
    },
    orderer: {
      uuid: '1fee2f21-82f3-4aab-8d87-f1cf19034649',
      display: 'nurse - Jane Nurse',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/provider/1fee2f21-82f3-4aab-8d87-f1cf19034649',
          resourceAlias: 'provider',
        },
      ],
    },
    orderReason: null,
    orderReasonNonCoded: null,
    orderType: {
      uuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
      display: 'Test Order',
      name: 'Test Order',
      javaClassName: 'org.openmrs.TestOrder',
      retired: false,
      description: 'Order type for test orders',
      conceptClasses: [],
      parent: null,
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e',
          resourceAlias: 'ordertype',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e?v=full',
          resourceAlias: 'ordertype',
        },
      ],
      resourceVersion: '1.10',
    },
    urgency: 'ROUTINE',
    instructions: null,
    commentToFulfiller: null,
    display: 'Serum chloride',
    auditInfo: {
      creator: {
        uuid: 'A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
        display: 'daemon',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/user/A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
            resourceAlias: 'user',
          },
        ],
      },
      dateCreated: '2024-11-19T18:41:02.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    fulfillerStatus: null,
    fulfillerComment: null,
    specimenSource: null,
    laterality: null,
    clinicalHistory: null,
    frequency: null,
    numberOfRepeats: null,
    links: [
      {
        rel: 'self',
        uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/order/4da57fd0-bd0c-4d23-8119-c70fc7e99840',
        resourceAlias: 'order',
      },
    ],
    type: 'testorder',
    resourceVersion: '1.10',
  },
  {
    uuid: 'bf433d94-ff10-4401-9d0f-7f3a2b2d5cc0',
    orderNumber: 'ORD-196',
    accessionNumber: null,
    patient: {
      uuid: 'ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
      display: '100014M - Daniel Scott',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/patient/ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
          resourceAlias: 'patient',
        },
      ],
    },
    concept: {
      uuid: '159497AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Serum calcium',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/159497AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          resourceAlias: 'concept',
        },
      ],
    },
    action: 'NEW',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      name: 'Outpatient',
      description: 'Out-patient care setting',
      retired: false,
      careSettingType: 'OUTPATIENT',
      display: 'Outpatient',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
          resourceAlias: 'caresetting',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0?v=full',
          resourceAlias: 'caresetting',
        },
      ],
      resourceVersion: '1.10',
    },
    previousOrder: null,
    dateActivated: '2022-11-20T21:52:55.000+0000',
    scheduledDate: null,
    dateStopped: null,
    autoExpireDate: null,
    encounter: {
      uuid: '9468dc74-3b4c-4db9-b782-2a05df88e099',
      display: 'Order 11/20/2022',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/encounter/9468dc74-3b4c-4db9-b782-2a05df88e099',
          resourceAlias: 'encounter',
        },
      ],
    },
    orderer: {
      uuid: '1fee2f21-82f3-4aab-8d87-f1cf19034649',
      display: 'nurse - Jane Nurse',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/provider/1fee2f21-82f3-4aab-8d87-f1cf19034649',
          resourceAlias: 'provider',
        },
      ],
    },
    orderReason: null,
    orderReasonNonCoded: null,
    orderType: {
      uuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
      display: 'Test Order',
      name: 'Test Order',
      javaClassName: 'org.openmrs.TestOrder',
      retired: false,
      description: 'Order type for test orders',
      conceptClasses: [],
      parent: null,
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e',
          resourceAlias: 'ordertype',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e?v=full',
          resourceAlias: 'ordertype',
        },
      ],
      resourceVersion: '1.10',
    },
    urgency: 'ROUTINE',
    instructions: null,
    commentToFulfiller: null,
    display: 'Serum calcium',
    auditInfo: {
      creator: {
        uuid: 'A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
        display: 'daemon',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/user/A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
            resourceAlias: 'user',
          },
        ],
      },
      dateCreated: '2024-11-19T18:41:02.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    fulfillerStatus: null,
    fulfillerComment: null,
    specimenSource: null,
    laterality: null,
    clinicalHistory: null,
    frequency: null,
    numberOfRepeats: null,
    links: [
      {
        rel: 'self',
        uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/order/bf433d94-ff10-4401-9d0f-7f3a2b2d5cc0',
        resourceAlias: 'order',
      },
    ],
    type: 'testorder',
    resourceVersion: '1.10',
  },
  {
    uuid: '051645fa-b0e0-43d0-a7a1-021b41ade67b',
    orderNumber: 'ORD-195',
    accessionNumber: null,
    patient: {
      uuid: 'ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
      display: '100014M - Daniel Scott',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/patient/ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
          resourceAlias: 'patient',
        },
      ],
    },
    concept: {
      uuid: '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Serum glucose',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          resourceAlias: 'concept',
        },
      ],
    },
    action: 'NEW',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      name: 'Outpatient',
      description: 'Out-patient care setting',
      retired: false,
      careSettingType: 'OUTPATIENT',
      display: 'Outpatient',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
          resourceAlias: 'caresetting',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0?v=full',
          resourceAlias: 'caresetting',
        },
      ],
      resourceVersion: '1.10',
    },
    previousOrder: null,
    dateActivated: '2022-11-20T21:52:55.000+0000',
    scheduledDate: null,
    dateStopped: null,
    autoExpireDate: null,
    encounter: {
      uuid: '9468dc74-3b4c-4db9-b782-2a05df88e099',
      display: 'Order 11/20/2022',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/encounter/9468dc74-3b4c-4db9-b782-2a05df88e099',
          resourceAlias: 'encounter',
        },
      ],
    },
    orderer: {
      uuid: '1fee2f21-82f3-4aab-8d87-f1cf19034649',
      display: 'nurse - Jane Nurse',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/provider/1fee2f21-82f3-4aab-8d87-f1cf19034649',
          resourceAlias: 'provider',
        },
      ],
    },
    orderReason: null,
    orderReasonNonCoded: null,
    orderType: {
      uuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
      display: 'Test Order',
      name: 'Test Order',
      javaClassName: 'org.openmrs.TestOrder',
      retired: false,
      description: 'Order type for test orders',
      conceptClasses: [],
      parent: null,
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e',
          resourceAlias: 'ordertype',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e?v=full',
          resourceAlias: 'ordertype',
        },
      ],
      resourceVersion: '1.10',
    },
    urgency: 'ROUTINE',
    instructions: null,
    commentToFulfiller: null,
    display: 'Serum glucose',
    auditInfo: {
      creator: {
        uuid: 'A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
        display: 'daemon',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/user/A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
            resourceAlias: 'user',
          },
        ],
      },
      dateCreated: '2024-11-19T18:41:02.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    fulfillerStatus: null,
    fulfillerComment: null,
    specimenSource: null,
    laterality: null,
    clinicalHistory: null,
    frequency: null,
    numberOfRepeats: null,
    links: [
      {
        rel: 'self',
        uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/order/051645fa-b0e0-43d0-a7a1-021b41ade67b',
        resourceAlias: 'order',
      },
    ],
    type: 'testorder',
    resourceVersion: '1.10',
  },
  {
    uuid: 'c71c1c33-f471-4f9d-be46-32dfbfb707b9',
    orderNumber: 'ORD-194',
    accessionNumber: null,
    patient: {
      uuid: 'ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
      display: '100014M - Daniel Scott',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/patient/ae493d14-c793-4fce-8f1d-6f0cc6ad0010',
          resourceAlias: 'patient',
        },
      ],
    },
    concept: {
      uuid: '1458AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Serum glucose (mmol)',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/1458AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          resourceAlias: 'concept',
        },
      ],
    },
    action: 'NEW',
    careSetting: {
      uuid: '6f0c9a92-6f24-11e3-af88-005056821db0',
      name: 'Outpatient',
      description: 'Out-patient care setting',
      retired: false,
      careSettingType: 'OUTPATIENT',
      display: 'Outpatient',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0',
          resourceAlias: 'caresetting',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/caresetting/6f0c9a92-6f24-11e3-af88-005056821db0?v=full',
          resourceAlias: 'caresetting',
        },
      ],
      resourceVersion: '1.10',
    },
    previousOrder: null,
    dateActivated: '2022-11-20T21:52:55.000+0000',
    scheduledDate: null,
    dateStopped: null,
    autoExpireDate: null,
    encounter: {
      uuid: '9468dc74-3b4c-4db9-b782-2a05df88e099',
      display: 'Order 11/20/2022',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/encounter/9468dc74-3b4c-4db9-b782-2a05df88e099',
          resourceAlias: 'encounter',
        },
      ],
    },
    orderer: {
      uuid: '1fee2f21-82f3-4aab-8d87-f1cf19034649',
      display: 'nurse - Jane Nurse',
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/provider/1fee2f21-82f3-4aab-8d87-f1cf19034649',
          resourceAlias: 'provider',
        },
      ],
    },
    orderReason: null,
    orderReasonNonCoded: null,
    orderType: {
      uuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
      display: 'Test Order',
      name: 'Test Order',
      javaClassName: 'org.openmrs.TestOrder',
      retired: false,
      description: 'Order type for test orders',
      conceptClasses: [],
      parent: null,
      links: [
        {
          rel: 'self',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e',
          resourceAlias: 'ordertype',
        },
        {
          rel: 'full',
          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e?v=full',
          resourceAlias: 'ordertype',
        },
      ],
      resourceVersion: '1.10',
    },
    urgency: 'ROUTINE',
    instructions: null,
    commentToFulfiller: null,
    display: 'Serum glucose (mmol)',
    auditInfo: {
      creator: {
        uuid: 'A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
        display: 'daemon',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/user/A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
            resourceAlias: 'user',
          },
        ],
      },
      dateCreated: '2024-11-19T18:41:01.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    fulfillerStatus: null,
    fulfillerComment: null,
    specimenSource: null,
    laterality: null,
    clinicalHistory: null,
    frequency: null,
    numberOfRepeats: null,
    links: [
      {
        rel: 'self',
        uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/order/c71c1c33-f471-4f9d-be46-32dfbfb707b9',
        resourceAlias: 'order',
      },
    ],
    type: 'testorder',
    resourceVersion: '1.10',
  },
];
