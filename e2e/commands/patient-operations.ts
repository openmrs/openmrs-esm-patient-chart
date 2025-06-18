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

export const generateRandomPatient = async (
  api: APIRequestContext,
  options: {
    age?: { years?: number; months?: number };
    birthdate?: string;
    birthdateEstimated?: boolean;
    gender?: string;
    givenName?: string;
    familyName?: string;
    address?: Address;
    identifiers?: Array<{
      identifier: string;
      identifierType: string;
      location: string;
      preferred: boolean;
    }>;
  } = {},
): Promise<Patient> => {
  let birthdate = options.birthdate;
  if (!birthdate && options.age) {
    const date = new Date();
    if (options.age.years) date.setFullYear(date.getFullYear() - options.age.years);
    if (options.age.months) date.setMonth(date.getMonth() - options.age.months);
    birthdate = date.toISOString().split('T')[0];
  }

  let identifiers = options.identifiers;
  if (!identifiers || identifiers.length === 0) {
    const identifierRes = await api.post('idgen/identifiersource/8549f706-7e85-4c1d-9424-217d50a2988b/identifier', {
      data: {},
    });
    await expect(identifierRes.ok()).toBeTruthy();
    const { identifier } = await identifierRes.json();

    identifiers = [
      {
        identifier,
        identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334',
        location: '44c3efb0-2583-4c80-a79e-1f756a03c0a1',
        preferred: true,
      },
    ];
  }
  // Default values matching the original generateRandomPatient
  const defaultAddress = {
    address1: 'Bom Jesus Street',
    cityVillage: 'Recife',
    country: 'Brazil',
    postalCode: '50030-310',
    stateProvince: 'Pernambuco',
  };

  const patientData = {
    identifiers,
    person: {
      addresses: [options.address || defaultAddress],
      attributes: [],
      birthdate: birthdate || '2020-02-01', // Default birthdate if none provided
      birthdateEstimated: options.birthdateEstimated ?? true,
      dead: false,
      gender: options.gender || 'M', // Default to Male
      names: [
        {
          givenName: options.givenName || `Patient${Math.floor(Math.random() * 10000)}`,
          familyName: options.familyName || `Doe${Math.floor(Math.random() * 10000)}`,
          preferred: true,
        },
      ],
    },
  };
  const patientRes = await api.post('patient', { data: patientData });

  if (!patientRes.ok()) {
    const error = await patientRes.text();
    console.error('Patient creation failed. Request payload:', patientData);
    throw new Error(`Failed to create patient: ${error}`);
  }
  return await patientRes.json();
};

export const getPatient = async (api: APIRequestContext, uuid: string): Promise<Patient> => {
  const patientRes = await api.get(`patient/${uuid}?v=full`);
  return await patientRes.json();
};

export const deletePatient = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`patient/${uuid}`, { data: {} });
  await expect(response.ok()).toBeTruthy();
};
