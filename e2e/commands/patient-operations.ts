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
  const identifierRes = await api.post('idgen/identifiersource/8549f706-7e85-4c1d-9424-217d50a2988b/identifier', {
    data: {},
  });
  await expect(identifierRes.ok()).toBeTruthy();
  const { identifier } = await identifierRes.json();

  const patientRes = await api.post('patient', {
    // TODO: This is not configurable right now. It probably should be.
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

export const generateNewbornPatient = async (
  api: APIRequestContext,
  ageInMonths: number = 1,
  birthdateEstimated: boolean = false,
): Promise<Patient> => {
  const date = new Date();
  date.setMonth(date.getMonth() - ageInMonths);
  const birthdate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const identifierRes = await api.post('idgen/identifiersource/8549f706-7e85-4c1d-9424-217d50a2988b/identifier', {
    data: {},
  });
  await expect(identifierRes.ok()).toBeTruthy();
  const { identifier } = await identifierRes.json();

  const patientRes = await api.post('patient', {
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
            address1: 'Newborn Lane',
            address2: '',
            cityVillage: 'Babyville',
            country: 'Wonderland',
            postalCode: '00000',
            stateProvince: 'Hope',
          },
        ],
        attributes: [],
        birthdate,
        birthdateEstimated,
        dead: false,
        gender: 'M',
        names: [
          {
            givenName: `Baby${Math.floor(Math.random() * 10000)}`,
            familyName: `Doe${Math.floor(Math.random() * 10000)}`,
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

export const generatePatientByAge = async (
  api: APIRequestContext,
  age: { years?: number; months?: number },
  birthdateEstimated: boolean = false,
): Promise<Patient> => {
  const date = new Date();

  if (age.years) {
    date.setFullYear(date.getFullYear() - age.years);
  }
  if (age.months) {
    date.setMonth(date.getMonth() - age.months);
  }

  const birthdate = date.toISOString().split('T')[0];

  const identifierRes = await api.post('idgen/identifiersource/8549f706-7e85-4c1d-9424-217d50a2988b/identifier', {
    data: {},
  });
  await expect(identifierRes.ok()).toBeTruthy();
  const { identifier } = await identifierRes.json();

  const patientRes = await api.post('patient', {
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
            address1: 'Test Street',
            cityVillage: 'Test City',
            country: 'Test Country',
          },
        ],
        attributes: [],
        birthdate,
        birthdateEstimated,
        dead: false,
        gender: Math.random() > 0.5 ? 'M' : 'F',
        names: [
          {
            givenName: `Patient${Math.floor(Math.random() * 10000)}`,
            familyName: `Cliff${Math.floor(Math.random() * 10000)}`,
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
  const patientRes = await api.get(`patient/${uuid}?v=full`);
  return await patientRes.json();
};

export const deletePatient = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`patient/${uuid}`, { data: {} });
};
