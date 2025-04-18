import type { Encounter, Visit, VisitType } from '@openmrs/esm-framework';
import { mockEncounter } from './encounters.mock';

export const mockVisitTypes: VisitType[] = [
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

export const mockCurrentVisit: Visit = {
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

// a visit that has ended
export const mockVisit2: Visit = {
  ...mockCurrentVisit,
  uuid: 'a6906dfe-0bdc-11f0-9a36-00155d6fa44e',
  startDatetime: new Date('2020-01-01T00:00:00.000+0000').toISOString(),
  stopDatetime: new Date('2020-01-01T01:00:00.000+0000').toISOString(),
};

// a visit that has ended
export const mockVisit3: Visit = {
  ...mockCurrentVisit,
  uuid: 'dd025938-0bdc-11f0-a3b8-00155d6fa44e',
  startDatetime: new Date('2019-01-01T00:00:00.000+0000').toISOString(),
  stopDatetime: new Date('2019-01-01T01:00:00.000+0000').toISOString(),
};

export const visitOverviewDetailMockData: { data: { results: Array<Visit> } } = {
  data: {
    results: [
      {
        uuid: '8e2f177c-8999-4fde-ba92-1e62b33179ac',
        patient: {
          uuid: 'some-uuid',
        },
        encounters: [
          {
            uuid: 'c2f0d397-4f3e-486a-abc4-4565caa0f09c',
            diagnoses: [],
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

export const mockOngoingVisitWithEncounters: Visit = {
  ...mockVisit,
  uuid: '42e03650-0401-11f0-9a86-00155dc8b906',
  startDatetime: '2022-01-01T10:00:00.000+0000',
  stopDatetime: null,
  encounters: [
    {
      ...mockEncounter,
      uuid: '0e0ebbc2-0401-11f0-b5f9-00155dc8b906',
      encounterDatetime: '2022-01-01T11:00:00.000+0000',
    },
    {
      ...mockEncounter,
      uuid: '18283232-0401-11f0-b111-00155dc8b906',
      encounterDatetime: '2022-01-01T11:30:00.000+0000',
    },
  ],
};

export const mockPastVisitWithEncounters: Visit = {
  ...mockOngoingVisitWithEncounters,
  uuid: '2993cedc-0401-11f0-9b1f-00155dc8b906',
  startDatetime: '2022-01-01T10:00:00.000+0000',
  stopDatetime: '2022-01-01T12:00:00.000+0000',
};

export const mockVisitWithAttributes = {
  ...mockVisit,
  uuid: '380d78c8-0401-11f0-ad28-00155dc8b906',
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
