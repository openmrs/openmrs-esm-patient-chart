import { Encounter, EncounterType } from '@openmrs/esm-framework';
import { mockPatientAlice } from './patient.mock';

export const mockEncounterTypeAdmission: EncounterType = {
  uuid: '9c7877f8-16db-11f0-a002-00155db2a7da',
  display: 'Admission',
};

export const mockEncounterTypeVisitNote: EncounterType = {
  uuid: '10056ed2-16dd-11f0-a337-00155db2a7d',
  display: 'Visit Note',
};

export const mockEncounterTypeConsultation: EncounterType = {
  uuid: 'e0b8402c-16dd-11f0-ac5f-00155db2a7da',
  display: 'Consultation',
};

export const mockEncounterTypes: Array<EncounterType> = [
  mockEncounterTypeAdmission,
  mockEncounterTypeVisitNote,
  mockEncounterTypeConsultation,
];

export const mockEncountersAlice: Array<Encounter> = [
  {
    uuid: '979d38e3-fb68-47cf-843f-2b0263690f49',
    encounterDatetime: '2022-01-18T16:25:27.000+0000',
    patient: mockPatientAlice,
    encounterType: mockEncounterTypeAdmission,
    editPrivilege: null,
    form: {
      uuid: '17e3bc1a-d319-408f-8b57-73e367f7fa80',
      display: 'POC Consent Form',
    },
    obs: [],
    visit: {
      uuid: 'd6e042c2-16db-11f0-8ab9-00155db2a7da',
      display: '',
      visitType: {
        uuid: '073dca16-16dc-11f0-8494-00155db2a7da',
        display: 'Facility Visit',
      },
      startDatetime: '2022-01-18T12:25:27.000+0000',
      stopDatetime: '2022-01-18T17:25:27.000+0000',
    },
    encounterProviders: [],
  },
  {
    uuid: '09eadbdd-6924-4126-8a3b-c92aac04b8e7',
    patient: mockPatientAlice,
    encounterDatetime: '2021-08-03T00:47:48.000+0000',
    encounterType: mockEncounterTypeVisitNote,
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
    visit: {
      uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
      visitType: {
        uuid: '073dca16-16dc-11f0-8494-00155db2a7da',
        display: 'Facility Visit',
      },
      startDatetime: '2021-08-03T00:27:48.000+0000',
      stopDatetime: '2021-08-03T00:57:48.000+0000',
    },
    encounterProviders: [
      {
        provider: {
          uuid: 'abb32022-16dd-11f0-bdc4-00155db2a7da',
          person: {
            display: 'User One',
            uuid: 'b51ebd2e-16dd-11f0-b23b-00155db2a7da',
          },
        },
        uuid: 'bd7d3662-16dd-11f0-aedb-00155db2a7da',
      },
    ],
  },
  {
    uuid: 'ff9a0035-8698-47dc-b608-bd6ec2646e5c',
    patient: mockPatientAlice,
    encounterDatetime: '2021-07-05T10:07:18.000+0000',
    encounterType: mockEncounterTypeConsultation,
    editPrivilege: {
      uuid: 'f25f3de4-16dd-11f0-9b43-00155db2a7da',
      display: 'edit',
    },
    form: {
      uuid: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
      display: 'Covid 19',
    },
    obs: [],
    encounterProviders: [
      {
        provider: {
          uuid: '2b297360-16de-11f0-8b7e-00155db2a7da',
          person: {
            display: 'Dennis The Doctor',
            uuid: '36236992-16de-11f0-a0c0-00155db2a7da',
          },
        },
        uuid: '30082ff2-16de-11f0-9f6a-00155db2a7da',
      },
    ],
    visit: {
      uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
      visitType: {
        uuid: '073dca16-16dc-11f0-8494-00155db2a7da',
        display: 'Facility Visit',
      },
      startDatetime: '2021-07-05T09:07:18.000+0000',
      stopDatetime: '2021-07-05T11:07:18.000+0000',
    },
  },
];

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
