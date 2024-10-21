import { type APIRequestContext, expect } from '@playwright/test';

export interface Patient {
  uuid: string;
  identifiers: Identifier[];
  display: string;
  person: {
    uuid: string;
    display: string;
    gender: string;
    age: number;
    birthdate: string;
    birthdateEstimated: boolean;
    dead: boolean;
    deathDate?: string;
    causeOfDeath?: string;
    preferredAddress: {
      address1: string;
      cityVillage: string;
      country: string;
      postalCode: string;
      stateProvince: string;
      countyDistrict: string;
    };
    attributes: Array<Record<string, unknown>>;
    voided: boolean;
    birthtime?: string;
    deathdateEstimated: boolean;
    resourceVersion: string;
  };
  attributes: { value: string; attributeType: { uuid: string; display: string } }[];
  voided: boolean;
}

export interface Address {
  preferred: boolean;
  address1: string;
  cityVillage: string;
  country: string;
  postalCode: string;
  stateProvince: string;
}

export interface Identifier {
  uuid: string;
  display: string;
}

export const generateRandomPatient = async (api: APIRequestContext): Promise<Patient> => {
  const identifierRes = await api.post(
    'rest/v1/idgen/identifiersource/8549f706-7e85-4c1d-9424-217d50a2988b/identifier',
    {
      data: {},
    },
  );
  await expect(identifierRes.ok()).toBeTruthy();
  const { identifier } = await identifierRes.json();

  const patientRes = await api.post('rest/v1/patient', {
    data: {
      identifiers: [
        {
          identifier,
          identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334',
          location: '44c3efb0-2583-4c80-a79e-1f756a03c0a1',
          preferred: true,
        },
      ],
      person: {
        addresses: [
          {
            address1: 'Bom Jesus Street',
            address2: '',
            cityVillage: 'Recife',
            country: 'Brazil',
            postalCode: '50030-310',
            stateProvince: 'Pernambuco',
          },
        ],
        attributes: [],
        birthdate: '2020-2-1',
        birthdateEstimated: true,
        dead: false,
        gender: 'M',
        names: [
          {
            familyName: `Smith${Math.floor(Math.random() * 10000)}`,
            givenName: `John${Math.floor(Math.random() * 10000)}`,
            middleName: '',
            preferred: true,
          },
        ],
      },
    },
  });
  await expect(patientRes.ok()).toBeTruthy();
  return await patientRes.json();
};

export const getPatient = async (api: APIRequestContext, uuid: string): Promise<Patient> => {
  const patientRes = await api.get(`rest/v1/patient/${uuid}?v=full`);
  return await patientRes.json();
};

export const deletePatient = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`rest/v1/patient/${uuid}`, { data: {} });
};

export const createImmunizations = async (api: APIRequestContext, uuid: string, visit: string) => {
  const immunizationData = {
    resourceType: 'Immunization',
    status: 'completed',
    vaccineCode: {
      coding: [
        {
          code: '783AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hepatitis B vaccination',
        },
      ],
    },
    patient: {
      type: 'Patient',
      reference: `Patient/${uuid}`,
    },
    encounter: {
      type: 'Encounter',
      reference: `Encounter/${visit}`,
    },
    occurrenceDateTime: '2024-06-10T13:50:00.000Z',
    expirationDate: '2052-06-29T18:30:00.000Z',
    location: {
      type: 'Location',
      reference: `Location/${process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID}`,
    },
    performer: [
      {
        actor: {
          type: 'Practitioner',
          reference: 'Practitioner/f39e57d8-1185-4199-8567-6f1eeb160f05',
        },
      },
    ],
    manufacturer: {
      display: 'Sanofi Pasteur SA',
    },
    lotNumber: 'POLIO-001',
    protocolApplied: [
      {
        doseNumberPositiveInt: 1,
        series: null,
      },
    ],
  };

  const immunizationRes = await api.post('fhir2/R4/Immunization?_summary=data', {
    data: immunizationData,
  });
  await expect(immunizationRes.ok()).toBeTruthy();
  const immunization = await immunizationRes.json();
  return immunization;
};
