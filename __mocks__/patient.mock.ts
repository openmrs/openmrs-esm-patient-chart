import { Patient, PersonAddress } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export const mockFhirPatient: fhir.Patient = {
  resourceType: 'Patient',
  id: 'bfa09dac-ec9e-47c1-9ad3-e3ebdd5d722d',
  meta: {
    versionId: '1719312976000',
    lastUpdated: '2024-06-25T10:56:16.000+00:00',
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>bfa09dac-ec9e-47c1-9ad3-e3ebdd5d722d</td></tr><tr><td>Identifier:</td><td><div>100008E</div></td></tr><tr><td>Active:</td><td>true</td></tr><tr><td>Name:</td><td> Joshua <b>JOHNSON </b></td></tr><tr><td>Telecom:</td><td> +255777053243 </td></tr><tr><td>Gender:</td><td>MALE</td></tr><tr><td>Birth Date:</td><td>25/09/2019</td></tr><tr><td>Deceased:</td><td>false</td></tr><tr><td>Address:</td><td><span>Wakiso </span><span>Kayunga </span><span>Uganda </span></td></tr></tbody></table></div>',
  },
  identifier: [
    {
      id: 'fc6b122a-05bd-4128-8577-7efd8c87cda5',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/patient/identifier#location',
          valueReference: {
            reference: 'Location/736b08f9-94d6-4b50-ad58-6bc69b9cbfb8',
            // type: 'Location',
            display: 'Ward 50',
          },
        },
      ],
      use: 'official',
      type: {
        coding: [
          {
            code: '05a29f94-c0ed-11e2-94be-8c13b969e334',
          },
        ],
        text: 'OpenMRS ID',
      },
      value: '100008E',
    },
  ],
  active: true,
  name: [
    {
      id: '67ac67de-aac4-43b3-a0d4-677578a01047',
      text: 'Joshua Johnson',
      family: 'Johnson',
      given: ['Joshua'],
    },
  ],
  telecom: [
    {
      id: 'f3f3c756-d8f1-42ce-8d32-eefe2a86c306',
      value: '+255777053243',
    },
  ],
  gender: 'male',
  birthDate: '2019-09-25',
  deceasedBoolean: false,
  address: [
    {
      id: '1e9df4ab-0c73-4f99-b0bd-c2ddc239619b',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Nansana',
            },
          ],
        },
      ],
      use: 'home',
      city: 'Wakiso',
      state: 'Kayunga',
      postalCode: '00000',
      country: 'Uganda',
    },
    {
      id: '93167c61-81da-48e1-8a6d-91640a55ed73',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: '7befd893-a7ed-4080-986a-db5f5d38fda4',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: 'c0a87353-ab2c-4c39-ae7b-13e992206916',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: 'b1c92fab-8002-48ed-a1e1-72ab942d12da',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: 'c85af135-28a4-483d-864d-d97751c21ebd',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: 'a6a15f40-5cc8-47c0-89ee-8cc39d2c73f5',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: '72f199fa-f569-42fb-8f5a-bc1c7bed7bb8',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: '4e0251d4-c00e-4167-ad3e-077c485aa7ec',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: '1b932ad6-d50a-4c57-a3cf-0fee5b3226fa',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: '90c59f5a-2cb4-405f-8c2b-0b5d2746d5ae',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Address16442',
            },
          ],
        },
      ],
      use: 'old',
      city: 'City6442',
      state: 'State6442',
      postalCode: '20839',
      country: 'Country6442',
    },
    {
      id: '810f3756-cb30-4fd8-a729-f6c1a5847312',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Nansana',
            },
          ],
        },
      ],
      use: 'old',
      city: 'Wakiso',
      state: 'Kayunga',
      postalCode: '00000',
      country: 'Uganda',
    },
    {
      id: '72d21a40-c872-4b99-ac2a-f7b179c4aff2',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Nansana',
            },
          ],
        },
      ],
      use: 'old',
      city: 'Wakiso',
      state: 'Kayunga',
      postalCode: '00000',
      country: 'Uganda',
    },
    {
      id: '6f7781b2-4b4d-4c69-bde0-98127712aa76',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/address',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/address#address1',
              valueString: 'Nansana',
            },
          ],
        },
      ],
      use: 'old',
      city: 'Wakiso',
      state: 'Kayunga',
      postalCode: '00000',
      country: 'Uganda',
    },
  ],
};

const birthdate = '2000-01-01T00:00:00.000+0000';
const age = dayjs().diff(birthdate, 'years');

const mockAddress: PersonAddress = {
  postalCode: '12345',
  address1: '123 Main St',
  cityVillage: 'City',
  stateProvince: 'State',
  country: 'Country',
  preferred: true,
  uuid: 'add7e55',
};

export const mockPatientAlice: Patient = {
  uuid: '00000000-0000-0001-0000-000000000000',
  display: 'Alice Johnson',
  identifiers: [],
  person: {
    uuid: '00000000-0001-0000-0000-000000000000',
    display: 'Alice Johnson',
    gender: 'F',
    age: age,
    birthdate: birthdate,
    birthdateEstimated: false,
    dead: false,
    deathDate: null,
    causeOfDeath: null,
    preferredName: {
      display: 'Alice Johnson',
      givenName: 'Alice',
      familyName: 'Johnson',
      uuid: 'preferred-name-uuid',
    },
    preferredAddress: mockAddress as PersonAddress,
    names: [null],
    addresses: [],
    attributes: [],
    birthtime: null,
    deathdateEstimated: null,
    causeOfDeathNonCoded: null,
  },
};
