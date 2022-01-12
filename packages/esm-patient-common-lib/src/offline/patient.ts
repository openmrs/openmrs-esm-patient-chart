import { fetchCurrentPatient } from '@openmrs/esm-framework';
import useSWR, { SWRResponse } from 'swr';

export function usePatient(patientUuid: string): SWRResponse<fhir.Patient, Error> {
  return useSWR(`patient/${patientUuid}`, async () => {
    const onlinePatient = await fetchCurrentPatient(patientUuid);

    if (!onlinePatient || onlinePatient.data.issue) {
      return await getOfflineRegisteredPatient(patientUuid);
    }

    return onlinePatient.data;
  });
}

export async function getOfflineRegisteredPatient(patientUuid: string): Promise<fhir.Patient> {
  return {
    resourceType: 'Patient',
    id: 'ba8d5a3e-0309-4e96-ba21-94b9e331581b',
    text: {
      status: 'generated',
      div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>8673ee4f-e2ab-4077-ba55-4980f408773e</td></tr><tr><td>Identifier:</td><td><div>100GEJ</div><div>1001MH</div></td></tr><tr><td>Active:</td><td>true</td></tr><tr><td>Name:</td><td> John <b>WILSON </b></td></tr><tr><td>Telecom:</td><td> 00000000 </td></tr><tr><td>Gender:</td><td>MALE</td></tr><tr><td>Birth Date:</td><td>04/04/1972</td></tr><tr><td>Deceased:</td><td>false</td></tr><tr><td>Address:</td><td><span>Eldoret </span><span>Uasin Gishu </span><span>Kenya </span></td></tr></tbody></table></div>',
    },
    contained: [
      {
        resourceType: 'Provenance',
        id: '22848014-ba79-4dbd-bf63-b56e45f53414',
        recorded: '2017-01-18T09:42:40.000+00:00',
        activity: {
          coding: [
            { system: 'http://terminology.hl7.org/CodeSystemv3-DataOperation', code: 'CREATE', display: 'create' },
          ],
        },
        agent: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystemprovenance-participant-type',
                  code: 'author',
                  display: 'Author',
                },
              ],
            },
            role: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystemv3-ParticipationType',
                    code: 'AUT',
                    display: 'author',
                  },
                ],
              },
            ],
            who: {
              reference: 'Practitioner/A4F30A1B-5EB9-11DF-A648-37A07F9C90FB',
              type: 'Practitioner',
              display: 'User One',
            },
          },
        ],
      },
    ],
    identifier: [
      {
        id: '1f0ad7a1-430f-4397-b571-59ea654a52db',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/patient/identifier#location',
            valueReference: {
              reference: 'Location/8d6c993e-c2cc-11de-8d13-0010c6dffd0f',
              type: 'Location',
              display: 'Unknown Location',
            },
          },
        ],
        use: 'official',
        type: { text: 'Old Identification Number' },
        value: '100GEJ',
      },
      {
        id: 'e31506a4-5d7b-4d90-b9f1-817fee356680',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/patient/identifier#location',
            valueReference: {
              reference: 'Location/8d6c993e-c2cc-11de-8d13-0010c6dffd0f',
              type: 'Location',
              display: 'Unknown Location',
            },
          },
        ],
        use: 'usual',
        type: { text: 'OpenMRS ID' },
        value: '1001MH',
      },
    ],
    active: true,
    name: [{ id: 'efdb246f-4142-4c12-a27a-9be60b9592e9', family: 'Wilson', given: ['John'] }],
    telecom: [{ id: '57a06f1a-87b7-4a61-acf2-df6c8e820d69', value: '00000000' }],
    gender: 'male',
    birthDate: '1972-04-04',
    deceasedBoolean: false,
    address: [
      {
        id: 'f66b466b-e6a1-4b10-822d-b7006ad8c1bc',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'home',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '0c244eae-85c8-4cc9-b168-96b51f864e77',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Address10351' }],
          },
        ],
        use: 'old',
        city: 'City0351',
        state: 'State0351tested',
        postalCode: '60351',
        country: 'Country0351',
      },
      {
        id: 'b6db3317-a818-4aea-9e9b-65d675b22c30',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30100',
        country: 'Kenya',
      },
      {
        id: '645662b2-c586-4c2e-8b5f-5d451b8adc88',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30100',
        country: 'Kenya',
      },
      {
        id: '646aeeee-ca3c-4828-a9c1-35165f5f131f',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30100',
        country: 'Kenya',
      },
      {
        id: '48585757-c6c9-499f-910f-ecc0b1e9950d',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30100',
        country: 'Kenya',
      },
      {
        id: '461807b8-b50b-4a81-a2ba-3843523714ad',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30100',
        country: 'Kenya',
      },
      {
        id: 'd8487409-0dff-4b17-9647-fb9390832046',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30100',
        country: 'Kenya',
      },
      {
        id: '53342624-6819-4d42-bb0b-5ca3f27f0a24',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30101',
        country: 'Kenya',
      },
      {
        id: '701e0039-fae7-43f2-93be-7eebdb539ff3',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30101',
        country: 'Kenya',
      },
      {
        id: 'd3adcb18-34b0-4797-a660-f9bd0bfcd9ba',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30101',
        country: 'Kenya',
      },
      {
        id: 'de4c1c28-f3ea-4128-970d-70067206d2b3',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30101',
        country: 'Kenya',
      },
      {
        id: 'b6380d3a-c7eb-4b28-aab3-03c1294037b6',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30101',
        country: 'Kenya',
      },
      {
        id: 'c85aeccd-6d53-4daa-aed9-dca5957fbd32',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '30101',
        country: 'Kenya',
      },
      {
        id: '3522adfa-cfdf-41f4-908a-f2ce798050a7',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '12345',
        country: 'Kenya',
      },
      {
        id: '18d170c5-50a0-4c01-a86f-952835b93d20',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '12345',
        country: 'Kenya',
      },
      {
        id: 'f77e89fc-114b-4105-a524-ebb1d445e808',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: 'a750c67e-2a19-4c26-b2dd-d3879e2dad73',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '30c4a3df-47ce-4d38-8854-3ddca79f495f',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '0fe70fec-5b04-4ec0-ab41-b6d02e3388b1',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '17ce90b6-e852-42be-8795-507c02f433bd',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '405ec876-3118-4b0a-afb9-1166e75e7d72',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '2042b45d-fdd1-4bdd-86ad-e3b6d62e3a60',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: 'a69bec43-9f41-429f-b429-491ae84ddb68',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '46e8dfff-00c1-414a-bdf2-a24db9dd3801',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: 'af2bcb71-3e45-4d55-9cb3-f6d313e2866c',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '623dfd8a-af90-4312-9cfb-0ae5b4319dbb',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
      {
        id: '6acac0fa-20f5-4d74-b2bc-1fa6dd0df079',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/address',
            extension: [{ url: 'http://fhir.openmrs.org/ext/address#address1', valueString: 'Pioneer' }],
          },
        ],
        use: 'old',
        city: 'Eldoret',
        state: 'Uasin Gishu',
        postalCode: '123456',
        country: 'Kenya',
      },
    ],
  } as any;
}
