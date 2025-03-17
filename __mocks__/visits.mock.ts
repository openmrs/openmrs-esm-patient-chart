import { Encounter, Visit } from '@openmrs/esm-framework';
import { MappedEncounter } from '../packages/esm-patient-chart-app/src/visit/visits-widget/visit.resource';

export const mockVisitTypes = [
  {
    uuid: 'some-uuid1',
    name: 'Outpatient Visit',
    display: 'Outpatient Visit',
  },
  {
    uuid: 'some-uuid2',
    name: 'HIV Return Visit',
    display: 'HIV Return Visit',
  },
];

export const mockVisitTypesDataResponse = {
  data: {
    results: mockVisitTypes,
  },
};

export const mockVisit: Visit = {
  uuid: '15dd49ba-4283-472f-bce3-05401f85c0d3',
  patient: {
    uuid: '5a4e7a05-e275-4c14-acab-cb86f3e16353',
    display: '102EWH - Test Patient Registration',
  },
  visitType: {
    uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    display: 'Facility Visit',
  },
  location: {
    uuid: '7fdfa2cb-bc95-405a-88c6-32b7673c0453',
    display: 'Laboratory',
  },
  startDatetime: '2020-07-28T10:29:00.000+0000',
  stopDatetime: '2020-07-29T10:29:00.000+0000',
  encounters: [],
  attributes: [],
};

export const mockCurrentVisit = {
  uuid: '17f512b4-d264-4113-a6fe-160cb38cb46e',
  encounters: [],
  patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
  visitType: {
    uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    display: 'Facility Visit',
  },
  attributes: [],
  startDatetime: new Date('2021-03-16T08:16:00.000+0000').toISOString(),
  stopDatetime: null,
  location: {
    uuid: '6351fcf4-e311-4a19-90f9-35667d99a8af',
    name: 'Registration Desk',
    display: 'Registration Desk',
  },
};

export const visitOverviewDetailMockData: { data: { results: Array<Visit> } } = {
  data: {
    results: [
      {
        uuid: '8e2f177c-8999-4fde-ba92-1e62b33179ac',
        encounters: [
          {
            uuid: 'c2f0d397-4f3e-486a-abc4-4565caa0f09c',
            encounterDatetime: '2021-08-25T15:18:54.000+0000',
            orders: [],
            obs: [
              {
                uuid: 'cfecc122-8527-44a0-8e95-0556dc377604',
                concept: {
                  uuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Pulse',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Pulse: 140.0',
                groupMembers: null,
                value: 140,
              },
              {
                uuid: 'eb5f8819-d641-4f32-b371-2954af689718',
                concept: {
                  uuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Arterial blood oxygen saturation (pulse oximeter)',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Arterial blood oxygen saturation (pulse oximeter): 89.0',
                groupMembers: null,
                value: 89,
              },
              {
                uuid: '1479d86c-41f2-49d4-8340-bfbd3c8f9902',
                concept: {
                  uuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Respiratory rate',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Respiratory rate: 35.0',
                groupMembers: null,
                value: 35,
              },
              {
                uuid: 'b13af9b2-9aef-488e-b844-e8e70bcd190a',
                concept: {
                  uuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Systolic',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Systolic: 80.0',
                groupMembers: null,
                value: 80,
              },
              {
                uuid: '56fc7429-6de6-44c0-87b3-4dee65c468e3',
                concept: {
                  uuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Diastolic',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Diastolic: 30.0',
                groupMembers: null,
                value: 30,
              },
              {
                uuid: '4815af36-28d2-41af-8c19-5a0e6226cb2e',
                concept: {
                  uuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Temperature (C)',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Temperature (C): 40.0',
                groupMembers: null,
                value: 40,
              },
              {
                uuid: '4ec8fb5d-63c5-470d-9838-73668b2d951b',
                concept: {
                  uuid: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'General patient note',
                  conceptClass: { uuid: '8d491e50-c2cc-11de-8d13-0010c6dffd0f', display: 'Question' },
                },
                display: 'General patient note: Looks very unwell',
                groupMembers: null,
                value: 'Looks very unwell',
              },
            ],
            encounterType: { uuid: '67a71486-1a54-468f-ac3e-7091a9a79584', display: 'Vitals' },
            encounterProviders: [],
          },
        ],
        visitType: { uuid: 'e89b4b06-8d7a-40e6-b5ad-d3209f47040b', name: 'ECH', display: 'ECH' },
        startDatetime: '2021-08-18T10:59:00.000+0000',
      },
    ],
  },
};

export const visitOverviewDetailMockDataNotEmpty: { data: { results: Array<Visit> } } = {
  data: {
    results: [
      {
        uuid: 'f540da3a-b1e9-493e-9f24-12affd7e4f0d',
        encounters: [
          {
            uuid: 'd3bd542d-be6e-4d8b-939e-24d25b5490c2',
            encounterDatetime: '2021-09-08T03:13:32.000+0000',
            orders: [
              {
                uuid: 'b309f63d-8b4a-4860-b7b1-93ade0fe96e8',
                dateActivated: '2021-09-08T03:19:31.000+0000',
                drug: { uuid: 'fc92c351-8a85-41b9-95bf-a7dfea46c9cd', name: 'sulfadoxine', strength: '500mg' },
                doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
                dose: 1,
                route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
                frequency: { uuid: '160862OFAAAAAAAAAAAAAAA', display: 'Once daily' },
                duration: 5,
                durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
                numRefills: 2,
                orderType: { uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7', display: 'Drug Order' },
                orderer: {
                  uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
                  person: { uuid: 'e7dd932e-c2ac-4917-bf66-e59793adbd5f', display: 'Fifty User' },
                },
              },
              {
                uuid: '3f9ebe93-ba40-47dd-99b6-2c78e6e64464',
                dateActivated: '2021-09-08T03:21:08.000+0000',
                drug: { uuid: 'fc92c351-8a85-41b9-95bf-a7dfea46c9cd', name: 'sulfadoxine', strength: '500mg' },
                doseUnits: null,
                dose: null,
                route: null,
                frequency: null,
                duration: null,
                durationUnits: null,
                numRefills: null,
                orderType: { uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7', display: 'Drug Order' },
                orderer: {
                  uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
                  person: { uuid: 'e7dd932e-c2ac-4917-bf66-e59793adbd5f', display: 'Fifty User' },
                },
              },
              {
                uuid: 'e4c565cf-b9ee-4fbd-adce-6e188444f71f',
                dateActivated: '2021-09-08T03:19:31.000+0000',
                drug: { uuid: 'fc92c351-8a85-41b9-95bf-a7dfea46c9cd', name: 'sulfadoxine', strength: '500mg' },
                doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
                dose: 1,
                route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
                frequency: { uuid: '160862OFAAAAAAAAAAAAAAA', display: 'Once daily' },
                duration: 5,
                durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
                numRefills: 2,
                orderType: { uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7', display: 'Drug Order' },
                orderer: {
                  uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
                  person: { uuid: 'e7dd932e-c2ac-4917-bf66-e59793adbd5f', display: 'Fifty User' },
                },
              },
            ],
            obs: [],
            encounterType: { uuid: 'e22e39fd-7db2-45e7-80f1-60fa0d5a4378', display: 'Admission' },
            encounterProviders: [
              {
                uuid: '5171be48-bcfc-4f74-972c-4212db900dc0',
                display: 'Super User: Unknown',
                encounterRole: { uuid: 'a0b03050-c99b-11e0-9572-0800200c9a66', display: 'Admin' },
                provider: {
                  uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
                  person: { uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' },
                },
              },
            ],
          },
          {
            uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
            encounterDatetime: '2021-09-08T03:09:37.000+0000',
            orders: [],
            diagnoses: [
              {
                display: 'Malaria, confirmed',
                rank: 1,
                uuid: 'ec5bd62a-38c6-4d03-b51c-4554468f3169',
              },
              {
                display: 'HUMAN IMMUNODEFICIENCY VIRUS (HIV) DISEASE',
                rank: 2,
                uuid: 'f1381ba6-f876-4ca8-96c8-309127372b95',
              },
            ],
            obs: [
              {
                uuid: '70fb26b6-78bf-4bb7-bea1-9d371a918759',
                concept: {
                  uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Text of encounter note',
                  conceptClass: { uuid: '8d491e50-c2cc-11de-8d13-0010c6dffd0f', display: 'Question' },
                },
                display: 'Text of encounter note: Patient seems very unwell\r\n',
                groupMembers: null,
                value: 'Patient seems very unwell\r\n',
              },
            ],
            encounterType: { uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79', display: 'Visit Note' },
            encounterProviders: [
              {
                uuid: '94a13298-5a0b-4a2a-b9aa-d1457cc4ad71',
                display: 'Super User: Unknown',
                encounterRole: { uuid: 'a0b03050-c99b-11e0-9572-0800200c9a66', display: 'Admin' },
                provider: {
                  uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
                  person: { uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' },
                },
              },
            ],
          },
        ],
        visitType: { uuid: 'a22733fa-3501-4020-a520-da024eeff088', name: 'Offline', display: 'Offline' },
        startDatetime: '2021-09-08T03:04:00.000+0000',
      },
    ],
  },
};

export const mockMappedEncounters: Array<MappedEncounter> = [
  {
    id: '979d38e3-fb68-47cf-843f-2b0263690f49',
    datetime: '2022-01-18T16:25:27.000+0000',
    encounterType: 'Admission',
    editPrivilege: null,
    form: {
      uuid: '17e3bc1a-d319-408f-8b57-73e367f7fa80',
      display: 'POC Consent Form',
    },
    obs: [],
    provider: '--',
    visitUuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    visitType: 'Facility Visit',
  },
  {
    id: '09eadbdd-6924-4126-8a3b-c92aac04b8e7',
    datetime: '2021-08-03T00:47:48.000+0000',
    encounterType: 'Visit Note',
    editPrivilege: null,
    form: null,
    obs: [
      {
        uuid: 'a93ad7a9-66d8-4952-ae2e-82b59c8c5989',
        concept: {
          uuid: '1421AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Immunization history',
          conceptClass: {
            uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f',
            display: 'Finding',
          },
        },
        display: 'Immunization history: asd, 333, 2021-08-05, 2021-08-02, 1.0, ',
        groupMembers: null,
        value: null,
        obsDatetime: null,
      },
      {
        uuid: '914965f1-059a-4e16-956a-b3bb9781b12a',
        concept: {
          uuid: '1421AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Immunization history',
          conceptClass: {
            uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f',
            display: 'Finding',
          },
        },
        display: 'Immunization history: 2021-08-02, 333, asd, , 1.0, 2021-08-05',
        groupMembers: null,
        value: null,
      },
    ],
    provider: 'User One',
    visitUuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    visitType: 'Facility Visit',
  },
  {
    id: 'ff9a0035-8698-47dc-b608-bd6ec2646e5c',
    datetime: '2021-07-05T10:07:18.000+0000',
    encounterType: 'Consultation',
    editPrivilege: 'edit',
    form: {
      uuid: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
      display: 'Covid 19',
    },
    obs: [],
    provider: 'Dennis The Doctor',
    visitUuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    visitType: 'Facility Visit',
  },
];

// This should be of type Encounter, but we don't have the Encounter type defined in core
export const mockEncounter: Encounter = {
  uuid: '3b4daf81-7372-475c-ba5d-13c9c21d8ab1',
  display: 'Consultation 09/23/2022',
  encounterDatetime: '2022-09-23T13:11:06.000+0000',
  patient: {
    uuid: 'b835eff8-98c9-4988-887b-d93da7fbd542',
    display: '100019A - George Roberts',
    links: [
      {
        rel: 'self',
        uri: 'http://backend:8080/openmrs/ws/rest/v1/patient/b835eff8-98c9-4988-887b-d93da7fbd542',
        resourceAlias: 'patient',
      },
    ],
  },
  location: null,
  form: {
    uuid: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
    display: 'Covid 19',
    links: [
      {
        rel: 'self',
        uri: 'http://backend:8080/openmrs/ws/rest/v1/form/9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
        resourceAlias: 'form',
      },
    ],
  },
  encounterType: {
    uuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
    display: 'Consultation',
    links: [
      {
        rel: 'self',
        uri: 'http://backend:8080/openmrs/ws/rest/v1/encountertype/dd528487-82a5-4082-9c72-ed246bd49591',
        resourceAlias: 'encountertype',
      },
    ],
  },
  obs: [
    {
      uuid: '04d7d2a2-8ffd-418c-9a0c-1d20dec50231',
      display: 'Covid 19 Signs and Symptom Set: Fever, Congestion, Loss of taste',
      links: [
        {
          rel: 'self',
          uri: 'http://backend:8080/openmrs/ws/rest/v1/obs/04d7d2a2-8ffd-418c-9a0c-1d20dec50231',
          resourceAlias: 'obs',
        },
      ],
    },
    {
      uuid: '5ca0c815-2c47-4cda-8c46-1e118b593ea8',
      display: 'Covid 19 Test Set: Positive, No, Respiratory PCR',
      links: [
        {
          rel: 'self',
          uri: 'http://backend:8080/openmrs/ws/rest/v1/obs/5ca0c815-2c47-4cda-8c46-1e118b593ea8',
          resourceAlias: 'obs',
        },
      ],
    },
  ],
  orders: [],
  voided: false,
  visit: null,
  encounterProviders: [],
  diagnoses: [],
  links: [
    {
      rel: 'self',
      uri: 'http://backend:8080/openmrs/ws/rest/v1/encounter/3b4daf81-7372-475c-ba5d-13c9c21d8ab1',
      resourceAlias: 'encounter',
    },
    {
      rel: 'full',
      uri: 'http://backend:8080/openmrs/ws/rest/v1/encounter/3b4daf81-7372-475c-ba5d-13c9c21d8ab1?v=full',
      resourceAlias: 'encounter',
    },
  ],
  resourceVersion: '2.2',
};

export const mockEncounters = [mockEncounter];

export const mockOngoingVisitWithEncounters: Visit = {
  ...mockVisit,
  startDatetime: '2022-01-01T10:00:00.000+0000',
  stopDatetime: null,
  encounters: [
    {
      ...mockEncounter,
      encounterDatetime: '2022-01-01T11:00:00.000+0000',
    },
    {
      ...mockEncounter,
      encounterDatetime: '2022-01-01T11:30:00.000+0000',
    },
  ],
};

export const mockPastVisitWithEncounters: Visit = {
  ...mockOngoingVisitWithEncounters,
  startDatetime: '2022-01-01T10:00:00.000+0000',
  stopDatetime: '2022-01-01T12:00:00.000+0000',
};

export const mockVisitWithAttributes = {
  ...mockVisit,
  attributes: [
    {
      attributeType: {
        uuid: 'aac48226-d143-4274-80e0-264db4e368ee',
        display: 'Insurance Policy Number',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/visitattributetype/aac48226-d143-4274-80e0-264db4e368ee',
            resourceAlias: 'visitattributetype',
          },
        ],
      },
      display: 'Insurance Policy Number: 832832',
      uuid: 'd6d7d26a-5975-4f03-8abb-db073c948897',
      value: '832832',
    },
    {
      attributeType: {
        uuid: '57ea0cbb-064f-4d09-8cf4-e8228700491c',
        display: 'Punctuality',
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/visitattributetype/57ea0cbb-064f-4d09-8cf4-e8228700491c',
            resourceAlias: 'visitattributetype',
          },
        ],
      },
      display: 'Punctuality: Concept #1092',
      uuid: 'c98e66d7-7db5-47ae-b46f-91a0f3b6dda1',
      value: {
        uuid: '66cdc0a1-aa19-4676-af51-80f66d78d9eb',
        display: 'On time',
        name: {
          display: 'On time',
          uuid: '03f6dd3e-d270-3ea6-a833-f867e49a40bb',
          name: 'On time',
          locale: 'en',
          localePreferred: true,
          conceptNameType: 'FULLY_SPECIFIED',
          links: [
            {
              rel: 'self',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb/name/03f6dd3e-d270-3ea6-a833-f867e49a40bb',
              resourceAlias: 'name',
            },
            {
              rel: 'full',
              uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb/name/03f6dd3e-d270-3ea6-a833-f867e49a40bb?v=full',
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
            uuid: 'dc2adaff-ae4d-30d2-9ce8-0b6ae2518f11',
            display: 'À temps',
            links: [
              {
                rel: 'self',
                uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb/name/dc2adaff-ae4d-30d2-9ce8-0b6ae2518f11',
                resourceAlias: 'name',
              },
            ],
          },
          {
            uuid: '03f6dd3e-d270-3ea6-a833-f867e49a40bb',
            display: 'On time',
            links: [
              {
                rel: 'self',
                uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb/name/03f6dd3e-d270-3ea6-a833-f867e49a40bb',
                resourceAlias: 'name',
              },
            ],
          },
          {
            uuid: '9c3ecda9-dd54-331e-aebf-d7426e358752',
            display: 'À temps',
            links: [
              {
                rel: 'self',
                uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb/name/9c3ecda9-dd54-331e-aebf-d7426e358752',
                resourceAlias: 'name',
              },
            ],
          },
          {
            uuid: '0ab86d36-0a8f-38f9-963e-8138251fc619',
            display: 'On time',
            links: [
              {
                rel: 'self',
                uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb/name/0ab86d36-0a8f-38f9-963e-8138251fc619',
                resourceAlias: 'name',
              },
            ],
          },
        ],
        descriptions: [],
        mappings: [],
        answers: [],
        setMembers: [],
        attributes: [],
        links: [
          {
            rel: 'self',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb',
            resourceAlias: 'concept',
          },
          {
            rel: 'full',
            uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/66cdc0a1-aa19-4676-af51-80f66d78d9eb?v=full',
            resourceAlias: 'concept',
          },
        ],
        resourceVersion: '2.0',
      },
    },
  ],
};
