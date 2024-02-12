export const currentSessionResponse = {
  data: {
    locale: 'en_GB',
    currentProvider: {
      uuid: 'b0f8686c-9de0-466e-abe6-d14e133b9337',
      display: '674737-1 - JJ Dick',
      person: {
        uuid: '4c357d29-f3e7-4b82-b808-aef52b46d8bd',
        display: 'JJ Dick',
      },
      identifier: '674737-1',
    },
    sessionLocation: {
      uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
      display: 'Inpatient Ward',
      name: 'Inpatient Ward',
      parentLocation: {
        uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
        display: 'Amani Hospital',
      },
    },
    user: {
      uuid: 'bff0f63d-d192-46c7-9bbd-932affa29b80',
      display: 'user-dev',
      username: 'user-dev',
      systemId: '9-1',
      userProperties: {
        loginAttempts: '0',
        lockoutTimestamp: '',
        'emrapi.lastViewedPatientIds': '88,37,470,552',
      },
      person: {
        uuid: '4c357d29-f3e7-4b82-b808-aef52b46d8bd',
        display: 'JJ Dick',
      },
    },
  },
};

export const providersResponse = {
  data: {
    results: [
      {
        person: {
          uuid: '4c357d29-f3e7-4b82-b808-aef52b46d8bd',
          display: 'User 2',
        },
        uuid: 'b0f8686c-9de0-466e-abe6-d14e133b9337',
      },
      {
        person: {
          uuid: 'fbd7a058-88c4-4747-b572-32aaf8ef6ac9',
          display: 'Admin 2',
        },
        uuid: 'd70ba2a2-4900-404b-bde3-7ce9e2de3cd6',
      },
      {
        person: {
          uuid: '5699bd1d-6619-4238-abc7-bed4ac005c8a',
          display: 'Tetema Tetema',
        },
        uuid: '5106e0ac-80a5-4d96-951b-cf881e3f06f3',
      },
      {
        person: {
          uuid: '945957d8-4b1e-4145-99cc-f1de95d33253',
          display: 'User One',
        },
        uuid: '28f22c92-fa65-4310-b9dd-85b1c7180e24',
      },
    ],
  },
};

export const locationsResponse = {
  data: {
    results: [
      {
        uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
        display: 'Amani Hospital',
      },
      {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward',
      },
      {
        uuid: '2131aff8-2e2a-480a-b7ab-4ac53250262b',
        display: 'Isolation Ward',
      },
      { uuid: '7fdfa2cb-bc95-405a-88c6-32b7673c0453', display: 'Laboratory' },
      {
        uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        display: 'Mosoriot Pharmacy',
      },
    ],
  },
};

export const mockFetchLocationByUuidResponse = {
  data: {
    uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
    display: 'Inpatient Ward',
  },
};

export const mockFetchProviderByUuidResponse = {
  data: {
    person: {
      uuid: '4c357d29-f3e7-4b82-b808-aef52b46d8bd',
      display: 'User 2',
    },
    uuid: 'b0f8686c-9de0-466e-abe6-d14e133b9337',
  },
};

export const diagnosisSearchResponse = {
  results: [
    {
      uuid: '119481AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Diabetes Mellitus',
    },
    {
      uuid: '142473AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Diabetes Mellitus, Type II',
    },
  ],
};

export const mockVisitNotesRequest = [
  {
    uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
    display: 'Visit Note 27/01/2022',
    encounterDatetime: '2022-01-27T16:51:29.000+0000',
    patient: {
      uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
      display: '100GEJ - John Wilson',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
        },
      ],
    },
    location: {
      uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
      display: 'Mosoriot Pharmacy',
      name: 'Mosoriot Pharmacy',
      description: null,
      address1: null,
      address2: null,
      cityVillage: null,
      stateProvince: null,
      country: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      countyDistrict: null,
      address3: null,
      address4: null,
      address5: null,
      address6: null,
      tags: [
        {
          uuid: '37dd4458-dc9e-4ae6-a1f1-789c1162d37b',
          display: 'Visit Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/37dd4458-dc9e-4ae6-a1f1-789c1162d37b',
            },
          ],
        },
        {
          uuid: '8d4626ca-7abd-42ad-be48-56767bbcf272',
          display: 'Transfer Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/8d4626ca-7abd-42ad-be48-56767bbcf272',
            },
          ],
        },
        {
          uuid: 'b8bbf83e-645f-451f-8efe-a0db56f09676',
          display: 'Login Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/b8bbf83e-645f-451f-8efe-a0db56f09676',
            },
          ],
        },
        {
          uuid: '1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
          display: 'Admission Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
            },
          ],
        },
      ],
      parentLocation: {
        uuid: '5035669f-00c0-4187-9ed6-f6b85128fb26',
        display: 'Mosoriot Subcounty Hospital',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/5035669f-00c0-4187-9ed6-f6b85128fb26',
          },
        ],
      },
      childLocations: [],
      retired: false,
      attributes: [],
      address7: null,
      address8: null,
      address9: null,
      address10: null,
      address11: null,
      address12: null,
      address13: null,
      address14: null,
      address15: null,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764?v=full',
        },
      ],
      resourceVersion: '2.0',
    },
    form: {
      uuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      display: 'Visit Note',
      name: 'Visit Note',
      description: null,
      encounterType: {
        uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
        display: 'Visit Note',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
          },
        ],
      },
      version: '1.0',
      build: null,
      published: false,
      formFields: [],
      retired: false,
      resources: [],
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    encounterType: {
      uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
      display: 'Visit Note',
      name: 'Visit Note',
      description:
        'Encounter where a full or abbreviated examination is done, usually leading to a presumptive or confirmed diagnosis, recorded by the examining clinician.',
      retired: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79?v=full',
        },
      ],
      resourceVersion: '1.8',
    },
    obs: [
      {
        uuid: 'c6a46535-2d4a-4bf0-b8eb-e1f9887c9191',
        display:
          'Text of encounter note: Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos quae maiores dolorem assumenda odit quasi tenetur non optio harum error nam distinctio explicabo, hic veritatis iusto quibusdam architecto. Nulla, ipsum.\nLorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos quae maiores dolorem assumenda odit quasi tenetur non optio harum error nam distinctio explicabo, hic veritatis iusto quibusdam architecto. Nulla, ipsum.',
        concept: {
          uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Text of encounter note',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2022-01-27T16:51:29.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: null,
        comment: null,
        location: {
          uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
          display: 'Mosoriot Pharmacy',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
            },
          ],
        },
        order: null,
        encounter: {
          uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
          display: 'Visit Note 27/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
            },
          ],
        },
        voided: false,
        value:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos quae maiores dolorem assumenda odit quasi tenetur non optio harum error nam distinctio explicabo, hic veritatis iusto quibusdam architecto. Nulla, ipsum.\nLorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos quae maiores dolorem assumenda odit quasi tenetur non optio harum error nam distinctio explicabo, hic veritatis iusto quibusdam architecto. Nulla, ipsum.',
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/c6a46535-2d4a-4bf0-b8eb-e1f9887c9191',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/c6a46535-2d4a-4bf0-b8eb-e1f9887c9191?v=full',
          },
        ],
        resourceVersion: '1.11',
      },
      {
        uuid: 'f46b209a-c93a-4913-ae43-e63e8bd5e3a9',
        display: 'Visit Diagnoses: Primary, Malaria, Presumed diagnosis',
        concept: {
          uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Visit Diagnoses',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2022-01-27T16:51:29.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: [
          {
            uuid: 'f0af2e84-ab7e-44c4-a028-b958e40aeefa',
            display: 'Diagnosis order: Primary',
            concept: {
              uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis order',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-27T16:51:29.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f46b209a-c93a-4913-ae43-e63e8bd5e3a9',
              display: 'Visit Diagnoses: Primary, Malaria, Presumed diagnosis',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f46b209a-c93a-4913-ae43-e63e8bd5e3a9',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
              display: 'Visit Note 27/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Primary',
              name: {
                display: 'Primary',
                uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Primary',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Principal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Đầu',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primordial',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Prensipal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display: 'Primary, principal or first (as in qualifier for diagnosis)',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 63161005',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159943',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f0af2e84-ab7e-44c4-a028-b958e40aeefa',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f0af2e84-ab7e-44c4-a028-b958e40aeefa?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '6f2a328a-ccdd-405b-b36d-90ef8278566a',
            display: 'PROBLEM LIST: Malaria',
            concept: {
              uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'PROBLEM LIST',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-27T16:51:29.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f46b209a-c93a-4913-ae43-e63e8bd5e3a9',
              display: 'Visit Diagnoses: Primary, Malaria, Presumed diagnosis',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f46b209a-c93a-4913-ae43-e63e8bd5e3a9',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
              display: 'Visit Note 27/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Malaria',
              name: {
                display: 'Malaria',
                uuid: '16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Malaria',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Diagnosis',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '130754BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Bệnh sốt rét',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/130754BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '83994BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Paludismo',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/83994BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malaria',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134406BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malarya',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134406BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '142032BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ملیریا',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/142032BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '16604BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Paludisme',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16604BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134405BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malaria',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134405BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '142031BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'малярия',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/142031BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '4639FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'A protozoan disease caused by four species of the genus PLASMODIUM (P. falciparum (MALARIA, FALCIPARUM), P. vivax (MALARIA, VIVAX), P. ovale, and P. malariae) and transmitted by the bite of an infected female mosquito of the genus Anopheles. Malaria is endemic in parts of Asia, Africa, Central and South America, Oceania, and certain Caribbean islands. It is characterized by extreme exhaustion associated with paroxysms of high fever, sweating, shaking chills, and anemia.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/4639FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '88127ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-10-WHO: B54',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/88127ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '143612ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/143612ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134582ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'AMPATH: 906',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/134582ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '267991ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'IMO ProblemIT: 28660',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/267991ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '73619ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 61462000',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/73619ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '182724ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 116128',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/182724ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '285654ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICPC2: A73',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/285654ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '133986ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'AMPATH: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/133986ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '286848ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-11-WHO: 1F4Z',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/286848ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '144370ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH Malawi: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/144370ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/6f2a328a-ccdd-405b-b36d-90ef8278566a',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/6f2a328a-ccdd-405b-b36d-90ef8278566a?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '712a20db-c6dc-4ed0-8f6d-8e2f4f523123',
            display: 'Diagnosis certainty: Presumed diagnosis',
            concept: {
              uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis certainty',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-27T16:51:29.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f46b209a-c93a-4913-ae43-e63e8bd5e3a9',
              display: 'Visit Diagnoses: Primary, Malaria, Presumed diagnosis',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f46b209a-c93a-4913-ae43-e63e8bd5e3a9',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
              display: 'Visit Note 27/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Presumed diagnosis',
              name: {
                display: 'Presumed diagnosis',
                uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Presumed diagnosis',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Presumed diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Impression clinique',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dyagnostik pwobab',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Diagnostic probable',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'The diagnosis is yet to be confirmed by special tests. This is the diagnosis based on clinical findings.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 410596003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Presumed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 1346',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159393',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/712a20db-c6dc-4ed0-8f6d-8e2f4f523123',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/712a20db-c6dc-4ed0-8f6d-8e2f4f523123?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
        ],
        comment: null,
        location: {
          uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
          display: 'Mosoriot Pharmacy',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
            },
          ],
        },
        order: null,
        encounter: {
          uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
          display: 'Visit Note 27/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
            },
          ],
        },
        voided: false,
        value: null,
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f46b209a-c93a-4913-ae43-e63e8bd5e3a9',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f46b209a-c93a-4913-ae43-e63e8bd5e3a9?v=full',
          },
        ],
        resourceVersion: '1.11',
      },
      {
        uuid: '5cb19a11-6171-4bc6-b00b-8db5c6385539',
        display: 'Visit Diagnoses: Presumed diagnosis, Secondary, Primary respiratory tuberculosis, confirmed',
        concept: {
          uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Visit Diagnoses',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2022-01-27T16:51:29.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: [
          {
            uuid: '2b1b7489-9fba-4cd1-9d14-94a41d464d42',
            display: 'Diagnosis certainty: Presumed diagnosis',
            concept: {
              uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis certainty',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-27T16:51:29.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: '5cb19a11-6171-4bc6-b00b-8db5c6385539',
              display: 'Visit Diagnoses: Presumed diagnosis, Secondary, Primary respiratory tuberculosis, confirmed',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/5cb19a11-6171-4bc6-b00b-8db5c6385539',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
              display: 'Visit Note 27/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Presumed diagnosis',
              name: {
                display: 'Presumed diagnosis',
                uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Presumed diagnosis',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Presumed diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Impression clinique',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dyagnostik pwobab',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Diagnostic probable',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'The diagnosis is yet to be confirmed by special tests. This is the diagnosis based on clinical findings.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 410596003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Presumed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 1346',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159393',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/2b1b7489-9fba-4cd1-9d14-94a41d464d42',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/2b1b7489-9fba-4cd1-9d14-94a41d464d42?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '2adf03b2-1132-4274-aa7b-082fedbc2aec',
            display: 'Diagnosis order: Secondary',
            concept: {
              uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis order',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-27T16:51:29.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: '5cb19a11-6171-4bc6-b00b-8db5c6385539',
              display: 'Visit Diagnoses: Presumed diagnosis, Secondary, Primary respiratory tuberculosis, confirmed',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/5cb19a11-6171-4bc6-b00b-8db5c6385539',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
              display: 'Visit Note 27/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Secondary',
              name: {
                display: 'Secondary',
                uuid: '107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Secondary',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '134532BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Secondaire',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134532BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Secondary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134533BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dezyèm',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134533BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16473FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display: 'Second or non-primary qualifier value such as for a diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16473FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '236983ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Secondary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236983ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '137044ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 2603003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/137044ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '217085ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159944',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/217085ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/2adf03b2-1132-4274-aa7b-082fedbc2aec',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/2adf03b2-1132-4274-aa7b-082fedbc2aec?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: 'efe4f8eb-1b07-41b5-b592-058c905d1b73',
            display: 'PROBLEM LIST: Primary respiratory tuberculosis, confirmed',
            concept: {
              uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'PROBLEM LIST',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-27T16:51:29.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: '5cb19a11-6171-4bc6-b00b-8db5c6385539',
              display: 'Visit Diagnoses: Presumed diagnosis, Secondary, Primary respiratory tuberculosis, confirmed',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/5cb19a11-6171-4bc6-b00b-8db5c6385539',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
              display: 'Visit Note 27/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Primary respiratory tuberculosis, confirmed',
              name: {
                display: 'Primary respiratory tuberculosis, confirmed',
                uuid: '1546c5f1-f0e1-4f15-bcc5-776890bae597',
                name: 'Primary respiratory tuberculosis, confirmed',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1546c5f1-f0e1-4f15-bcc5-776890bae597',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1546c5f1-f0e1-4f15-bcc5-776890bae597?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Diagnosis',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '119687BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'bacteriologisch en histologisch bevestigde primaire respiratoire tuberculose',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/119687BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '143801BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Tuberculose respiratoire, confirmée',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/143801BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '131671BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Первичный туберкулез органов дыхания, подтвержденный бактериологически и гистологически',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/131671BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '54745BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'tuberculosis respiratoria primaria, con confirmación bacteriológica e histológica',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/54745BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '1546c5f1-f0e1-4f15-bcc5-776890bae597',
                  display: 'Primary respiratory tuberculosis, confirmed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/1546c5f1-f0e1-4f15-bcc5-776890bae597',
                    },
                  ],
                },
                {
                  uuid: '143800BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primary respiratory tuberculosis, confirmed bacteriologically and histologically',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/143800BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [],
              mappings: [
                {
                  uuid: '115162ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-10-WHO: A15.7',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/115162ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '166997ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICPC2: A70',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/166997ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '155237ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: '3BT: 10124638',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/155237ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '38963ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 186201000',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/38963ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '241413ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'IMO ProblemIT: 599448',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/241413ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '143857ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 7135',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/143857ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '210791ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 152306',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/210791ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/152306AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/efe4f8eb-1b07-41b5-b592-058c905d1b73',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/efe4f8eb-1b07-41b5-b592-058c905d1b73?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
        ],
        comment: null,
        location: {
          uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
          display: 'Mosoriot Pharmacy',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
            },
          ],
        },
        order: null,
        encounter: {
          uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
          display: 'Visit Note 27/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
            },
          ],
        },
        voided: false,
        value: null,
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/5cb19a11-6171-4bc6-b00b-8db5c6385539',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/5cb19a11-6171-4bc6-b00b-8db5c6385539?v=full',
          },
        ],
        resourceVersion: '1.8',
      },
    ],
    voided: false,
    auditInfo: {
      creator: {
        uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
        display: 'doc',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
          },
        ],
      },
      dateCreated: '2022-01-27T16:51:55.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    visit: {
      uuid: '4d875d51-31b8-4d6e-a400-69ff10bb6db2',
      display: 'Facility Visit @ Mosoriot Pharmacy - 27/01/2022 03:52',
      patient: {
        uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
        display: '100GEJ - John Wilson',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          },
        ],
      },
      visitType: {
        uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
        display: 'Facility Visit',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visittype/7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
          },
        ],
      },
      indication: null,
      location: {
        uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        display: 'Mosoriot Pharmacy',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
          },
        ],
      },
      startDatetime: '2022-01-27T03:52:00.000+0000',
      stopDatetime: '2022-01-27T23:59:59.000+0000',
      encounters: [
        {
          uuid: '34b9436f-0744-4c08-9879-81fb4ec1e557',
          display: 'Visit Note 27/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
            },
          ],
        },
      ],
      attributes: [],
      voided: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visit/4d875d51-31b8-4d6e-a400-69ff10bb6db2',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visit/4d875d51-31b8-4d6e-a400-69ff10bb6db2?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    encounterProviders: [
      {
        uuid: '5d03cf6c-5d3c-4637-9aee-4b4b53f11081',
        provider: {
          uuid: '94b09d36-2308-46d3-99b5-6d7886ed5a53',
          display: 'fcgbnyjyjmy - doc doctor',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/provider/94b09d36-2308-46d3-99b5-6d7886ed5a53',
            },
          ],
        },
        encounterRole: {
          uuid: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          display: 'Clinician',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounterrole/240b26f9-dd88-4172-823d-4a8bfeb7841f',
            },
          ],
        },
        voided: false,
        links: [
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557/encounterprovider/5d03cf6c-5d3c-4637-9aee-4b4b53f11081?v=full',
          },
        ],
        resourceVersion: '1.9',
      },
    ],
    links: [
      {
        rel: 'self',
        uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/34b9436f-0744-4c08-9879-81fb4ec1e557',
      },
    ],
    resourceVersion: '1.9',
  },
  {
    uuid: '4c71a500-7998-40f8-8326-0bd36119d41a',
    display: 'Visit Note 14/01/2022',
    encounterDatetime: '2022-01-14T08:46:05.000+0000',
    patient: {
      uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
      display: '100GEJ - John Wilson',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
        },
      ],
    },
    location: {
      uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
      display: 'Mosoriot Pharmacy',
      name: 'Mosoriot Pharmacy',
      description: null,
      address1: null,
      address2: null,
      cityVillage: null,
      stateProvince: null,
      country: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      countyDistrict: null,
      address3: null,
      address4: null,
      address5: null,
      address6: null,
      tags: [
        {
          uuid: '37dd4458-dc9e-4ae6-a1f1-789c1162d37b',
          display: 'Visit Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/37dd4458-dc9e-4ae6-a1f1-789c1162d37b',
            },
          ],
        },
        {
          uuid: '8d4626ca-7abd-42ad-be48-56767bbcf272',
          display: 'Transfer Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/8d4626ca-7abd-42ad-be48-56767bbcf272',
            },
          ],
        },
        {
          uuid: 'b8bbf83e-645f-451f-8efe-a0db56f09676',
          display: 'Login Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/b8bbf83e-645f-451f-8efe-a0db56f09676',
            },
          ],
        },
        {
          uuid: '1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
          display: 'Admission Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
            },
          ],
        },
      ],
      parentLocation: {
        uuid: '5035669f-00c0-4187-9ed6-f6b85128fb26',
        display: 'Mosoriot Subcounty Hospital',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/5035669f-00c0-4187-9ed6-f6b85128fb26',
          },
        ],
      },
      childLocations: [],
      retired: false,
      attributes: [],
      address7: null,
      address8: null,
      address9: null,
      address10: null,
      address11: null,
      address12: null,
      address13: null,
      address14: null,
      address15: null,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764?v=full',
        },
      ],
      resourceVersion: '2.0',
    },
    form: {
      uuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      display: 'Visit Note',
      name: 'Visit Note',
      description: null,
      encounterType: {
        uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
        display: 'Visit Note',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
          },
        ],
      },
      version: '1.0',
      build: null,
      published: false,
      formFields: [],
      retired: false,
      resources: [],
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    encounterType: {
      uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
      display: 'Visit Note',
      name: 'Visit Note',
      description:
        'Encounter where a full or abbreviated examination is done, usually leading to a presumptive or confirmed diagnosis, recorded by the examining clinician.',
      retired: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79?v=full',
        },
      ],
      resourceVersion: '1.8',
    },
    obs: [
      {
        uuid: '9f87f016-018f-45e8-9733-999b3ea6a556',
        display: 'Visit Diagnoses: Presumed diagnosis, Malaria, Primary',
        concept: {
          uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Visit Diagnoses',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2022-01-14T08:46:05.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: [
          {
            uuid: 'ba85af65-afaa-4de7-9add-918cb6e7e2fa',
            display: 'Diagnosis certainty: Presumed diagnosis',
            concept: {
              uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis certainty',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-14T08:46:05.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: '9f87f016-018f-45e8-9733-999b3ea6a556',
              display: 'Visit Diagnoses: Presumed diagnosis, Malaria, Primary',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/9f87f016-018f-45e8-9733-999b3ea6a556',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '4c71a500-7998-40f8-8326-0bd36119d41a',
              display: 'Visit Note 14/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/4c71a500-7998-40f8-8326-0bd36119d41a',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Presumed diagnosis',
              name: {
                display: 'Presumed diagnosis',
                uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Presumed diagnosis',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Presumed diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Impression clinique',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dyagnostik pwobab',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Diagnostic probable',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'The diagnosis is yet to be confirmed by special tests. This is the diagnosis based on clinical findings.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 410596003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Presumed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 1346',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159393',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ba85af65-afaa-4de7-9add-918cb6e7e2fa',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ba85af65-afaa-4de7-9add-918cb6e7e2fa?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '8899c652-6c2a-4f04-b6c8-1a5c29ad686d',
            display: 'PROBLEM LIST: Malaria',
            concept: {
              uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'PROBLEM LIST',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-14T08:46:05.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: '9f87f016-018f-45e8-9733-999b3ea6a556',
              display: 'Visit Diagnoses: Presumed diagnosis, Malaria, Primary',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/9f87f016-018f-45e8-9733-999b3ea6a556',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '4c71a500-7998-40f8-8326-0bd36119d41a',
              display: 'Visit Note 14/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/4c71a500-7998-40f8-8326-0bd36119d41a',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Malaria',
              name: {
                display: 'Malaria',
                uuid: '16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Malaria',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Diagnosis',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '130754BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Bệnh sốt rét',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/130754BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '83994BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Paludismo',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/83994BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malaria',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134406BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malarya',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134406BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '142032BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ملیریا',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/142032BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '16604BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Paludisme',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16604BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134405BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malaria',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134405BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '142031BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'малярия',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/142031BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '4639FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'A protozoan disease caused by four species of the genus PLASMODIUM (P. falciparum (MALARIA, FALCIPARUM), P. vivax (MALARIA, VIVAX), P. ovale, and P. malariae) and transmitted by the bite of an infected female mosquito of the genus Anopheles. Malaria is endemic in parts of Asia, Africa, Central and South America, Oceania, and certain Caribbean islands. It is characterized by extreme exhaustion associated with paroxysms of high fever, sweating, shaking chills, and anemia.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/4639FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '88127ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-10-WHO: B54',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/88127ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '143612ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/143612ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134582ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'AMPATH: 906',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/134582ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '267991ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'IMO ProblemIT: 28660',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/267991ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '73619ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 61462000',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/73619ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '182724ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 116128',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/182724ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '285654ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICPC2: A73',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/285654ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '133986ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'AMPATH: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/133986ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '286848ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-11-WHO: 1F4Z',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/286848ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '144370ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH Malawi: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/144370ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/8899c652-6c2a-4f04-b6c8-1a5c29ad686d',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/8899c652-6c2a-4f04-b6c8-1a5c29ad686d?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '8fb423bf-6b18-4603-815b-4fe84d61ea1c',
            display: 'Diagnosis order: Primary',
            concept: {
              uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis order',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-14T08:46:05.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: '9f87f016-018f-45e8-9733-999b3ea6a556',
              display: 'Visit Diagnoses: Presumed diagnosis, Malaria, Primary',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/9f87f016-018f-45e8-9733-999b3ea6a556',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
              display: 'Mosoriot Pharmacy',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '4c71a500-7998-40f8-8326-0bd36119d41a',
              display: 'Visit Note 14/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/4c71a500-7998-40f8-8326-0bd36119d41a',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Primary',
              name: {
                display: 'Primary',
                uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Primary',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Principal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Đầu',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primordial',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Prensipal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display: 'Primary, principal or first (as in qualifier for diagnosis)',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 63161005',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159943',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/8fb423bf-6b18-4603-815b-4fe84d61ea1c',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/8fb423bf-6b18-4603-815b-4fe84d61ea1c?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
        ],
        comment: null,
        location: {
          uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
          display: 'Mosoriot Pharmacy',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
            },
          ],
        },
        order: null,
        encounter: {
          uuid: '4c71a500-7998-40f8-8326-0bd36119d41a',
          display: 'Visit Note 14/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/4c71a500-7998-40f8-8326-0bd36119d41a',
            },
          ],
        },
        voided: false,
        value: null,
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/9f87f016-018f-45e8-9733-999b3ea6a556',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/9f87f016-018f-45e8-9733-999b3ea6a556?v=full',
          },
        ],
        resourceVersion: '1.11',
      },
    ],
    orders: [],
    voided: false,
    auditInfo: {
      creator: {
        uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
        display: 'doc',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
          },
        ],
      },
      dateCreated: '2022-01-14T08:46:13.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    visit: {
      uuid: 'aeb98f1e-18ab-4877-9e81-98e40c87a1d8',
      display: 'Facility Visit @ Mosoriot Pharmacy - 14/01/2022 07:32',
      patient: {
        uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
        display: '100GEJ - John Wilson',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          },
        ],
      },
      visitType: {
        uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
        display: 'Facility Visit',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visittype/7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
          },
        ],
      },
      indication: null,
      location: {
        uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        display: 'Mosoriot Pharmacy',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/f76c0c8e-2c3a-443c-b26d-96a9f3847764',
          },
        ],
      },
      startDatetime: '2022-01-14T07:32:00.000+0000',
      stopDatetime: '2022-01-14T23:59:59.000+0000',
      encounters: [
        {
          uuid: '29c90b59-f960-47ce-8e35-b4669101a6b8',
          display: 'Vitals 14/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/29c90b59-f960-47ce-8e35-b4669101a6b8',
            },
          ],
        },
        {
          uuid: '9ba10a3a-8bc0-4602-9dfa-63b6444a91bf',
          display: 'Vitals 14/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/9ba10a3a-8bc0-4602-9dfa-63b6444a91bf',
            },
          ],
        },
        {
          uuid: 'd711d69d-41a8-4bac-beb3-7662423d7b54',
          display: 'Vitals 14/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/d711d69d-41a8-4bac-beb3-7662423d7b54',
            },
          ],
        },
        {
          uuid: '1577e091-2a3f-4ed7-be0f-8dec5442aa3b',
          display: 'Vitals 14/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/1577e091-2a3f-4ed7-be0f-8dec5442aa3b',
            },
          ],
        },
        {
          uuid: '4c71a500-7998-40f8-8326-0bd36119d41a',
          display: 'Visit Note 14/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/4c71a500-7998-40f8-8326-0bd36119d41a',
            },
          ],
        },
        {
          uuid: '7f6d28f3-c557-4a17-a8fc-bf77322a3692',
          display: 'Vitals 14/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/7f6d28f3-c557-4a17-a8fc-bf77322a3692',
            },
          ],
        },
      ],
      attributes: [],
      voided: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visit/aeb98f1e-18ab-4877-9e81-98e40c87a1d8',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visit/aeb98f1e-18ab-4877-9e81-98e40c87a1d8?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    encounterProviders: [
      {
        uuid: 'b06c75db-edca-4475-bf51-00ec7ec22b4c',
        provider: {
          uuid: '94b09d36-2308-46d3-99b5-6d7886ed5a53',
          display: 'fcgbnyjyjmy - doc doctor',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/provider/94b09d36-2308-46d3-99b5-6d7886ed5a53',
            },
          ],
        },
        encounterRole: {
          uuid: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          display: 'Clinician',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounterrole/240b26f9-dd88-4172-823d-4a8bfeb7841f',
            },
          ],
        },
        voided: false,
        links: [
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/4c71a500-7998-40f8-8326-0bd36119d41a/encounterprovider/b06c75db-edca-4475-bf51-00ec7ec22b4c?v=full',
          },
        ],
        resourceVersion: '1.9',
      },
    ],
    links: [
      {
        rel: 'self',
        uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/4c71a500-7998-40f8-8326-0bd36119d41a',
      },
    ],
    resourceVersion: '1.9',
  },
  {
    uuid: 'e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
    display: 'Visit Note 14/01/2022',
    encounterDatetime: '2022-01-14T08:42:22.000+0000',
    patient: {
      uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
      display: '100GEJ - John Wilson',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
        },
      ],
    },
    location: {
      uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
      display: 'Inpatient Ward',
      name: 'Inpatient Ward',
      description: null,
      address1: null,
      address2: null,
      cityVillage: null,
      stateProvince: null,
      country: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      countyDistrict: null,
      address3: null,
      address4: null,
      address5: null,
      address6: null,
      tags: [
        {
          uuid: '8d4626ca-7abd-42ad-be48-56767bbcf272',
          display: 'Transfer Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/8d4626ca-7abd-42ad-be48-56767bbcf272',
            },
          ],
        },
        {
          uuid: 'b8bbf83e-645f-451f-8efe-a0db56f09676',
          display: 'Login Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/b8bbf83e-645f-451f-8efe-a0db56f09676',
            },
          ],
        },
        {
          uuid: '1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
          display: 'Admission Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/locationtag/1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
            },
          ],
        },
      ],
      parentLocation: {
        uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
        display: 'Amani Hospital',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
          },
        ],
      },
      childLocations: [],
      retired: false,
      attributes: [],
      address7: null,
      address8: null,
      address9: null,
      address10: null,
      address11: null,
      address12: null,
      address13: null,
      address14: null,
      address15: null,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/b1a8b05e-3542-4037-bbd3-998ee9c40574',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/b1a8b05e-3542-4037-bbd3-998ee9c40574?v=full',
        },
      ],
      resourceVersion: '2.0',
    },
    form: {
      uuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      display: 'Visit Note',
      name: 'Visit Note',
      description: null,
      encounterType: {
        uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
        display: 'Visit Note',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
          },
        ],
      },
      version: '1.0',
      build: null,
      published: false,
      formFields: [],
      retired: false,
      resources: [],
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    encounterType: {
      uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
      display: 'Visit Note',
      name: 'Visit Note',
      description:
        'Encounter where a full or abbreviated examination is done, usually leading to a presumptive or confirmed diagnosis, recorded by the examining clinician.',
      retired: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79?v=full',
        },
      ],
      resourceVersion: '1.8',
    },
    obs: [
      {
        uuid: 'f1754028-1e8e-4fd1-82af-a110f2d0c9f7',
        display: 'Visit Diagnoses: Presumed diagnosis, Hemorrhage in early pregnancy, Primary',
        concept: {
          uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Visit Diagnoses',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2022-01-14T08:42:22.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: [
          {
            uuid: 'ab03d844-c7a8-4caa-84eb-c938aaf48eca',
            display: 'Diagnosis certainty: Presumed diagnosis',
            concept: {
              uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis certainty',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-14T08:42:22.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f1754028-1e8e-4fd1-82af-a110f2d0c9f7',
              display: 'Visit Diagnoses: Presumed diagnosis, Hemorrhage in early pregnancy, Primary',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1754028-1e8e-4fd1-82af-a110f2d0c9f7',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
              display: 'Inpatient Ward',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/b1a8b05e-3542-4037-bbd3-998ee9c40574',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: 'e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
              display: 'Visit Note 14/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Presumed diagnosis',
              name: {
                display: 'Presumed diagnosis',
                uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Presumed diagnosis',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Presumed diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Impression clinique',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dyagnostik pwobab',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Diagnostic probable',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'The diagnosis is yet to be confirmed by special tests. This is the diagnosis based on clinical findings.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 410596003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Presumed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 1346',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159393',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ab03d844-c7a8-4caa-84eb-c938aaf48eca',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ab03d844-c7a8-4caa-84eb-c938aaf48eca?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '4122120d-5168-45b6-8589-9257c766e4bb',
            display: 'PROBLEM LIST: Hemorrhage in early pregnancy',
            concept: {
              uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'PROBLEM LIST',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-14T08:42:22.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f1754028-1e8e-4fd1-82af-a110f2d0c9f7',
              display: 'Visit Diagnoses: Presumed diagnosis, Hemorrhage in early pregnancy, Primary',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1754028-1e8e-4fd1-82af-a110f2d0c9f7',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
              display: 'Inpatient Ward',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/b1a8b05e-3542-4037-bbd3-998ee9c40574',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: 'e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
              display: 'Visit Note 14/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Hemorrhage in early pregnancy',
              name: {
                display: 'Hemorrhage in early pregnancy',
                uuid: '17990BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Hemorrhage in early pregnancy',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/17990BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/17990BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Diagnosis',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '108095BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Haemorrhage in early pregnancy',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/108095BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '83122BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'hemorragia a principios del embarazo',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/83122BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '17990BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Hemorrhage in early pregnancy',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/17990BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '137095BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Hémorragie du début de la grossesse',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/137095BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [],
              mappings: [
                {
                  uuid: '275335ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-10-WHO: O20.9',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/275335ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '276099ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 117617',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/276099ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '72702ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 25825004',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/72702ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '276544ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'IMO ProblemIT: 13488',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/276544ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '275758ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 7226',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/275758ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/117617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/4122120d-5168-45b6-8589-9257c766e4bb',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/4122120d-5168-45b6-8589-9257c766e4bb?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '56808a18-c6e7-4bbd-b382-e5f1ec2064de',
            display: 'Diagnosis order: Primary',
            concept: {
              uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis order',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-14T08:42:22.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f1754028-1e8e-4fd1-82af-a110f2d0c9f7',
              display: 'Visit Diagnoses: Presumed diagnosis, Hemorrhage in early pregnancy, Primary',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1754028-1e8e-4fd1-82af-a110f2d0c9f7',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
              display: 'Inpatient Ward',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/b1a8b05e-3542-4037-bbd3-998ee9c40574',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: 'e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
              display: 'Visit Note 14/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Primary',
              name: {
                display: 'Primary',
                uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Primary',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Principal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Đầu',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primordial',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Prensipal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display: 'Primary, principal or first (as in qualifier for diagnosis)',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 63161005',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159943',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/56808a18-c6e7-4bbd-b382-e5f1ec2064de',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/56808a18-c6e7-4bbd-b382-e5f1ec2064de?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
        ],
        comment: null,
        location: {
          uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
          display: 'Inpatient Ward',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/b1a8b05e-3542-4037-bbd3-998ee9c40574',
            },
          ],
        },
        order: null,
        encounter: {
          uuid: 'e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
          display: 'Visit Note 14/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
            },
          ],
        },
        voided: false,
        value: null,
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1754028-1e8e-4fd1-82af-a110f2d0c9f7',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1754028-1e8e-4fd1-82af-a110f2d0c9f7?v=full',
          },
        ],
        resourceVersion: '1.11',
      },
    ],
    orders: [],
    voided: false,
    auditInfo: {
      creator: {
        uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
        display: 'doc',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
          },
        ],
      },
      dateCreated: '2022-01-14T08:42:57.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    visit: null,
    encounterProviders: [
      {
        uuid: '88cd0ac6-b670-493b-90ba-deaf5c4ded61',
        provider: {
          uuid: '94b09d36-2308-46d3-99b5-6d7886ed5a53',
          display: 'fcgbnyjyjmy - doc doctor',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/provider/94b09d36-2308-46d3-99b5-6d7886ed5a53',
            },
          ],
        },
        encounterRole: {
          uuid: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          display: 'Clinician',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounterrole/240b26f9-dd88-4172-823d-4a8bfeb7841f',
            },
          ],
        },
        voided: false,
        links: [
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/e4cd1b3e-c8dc-45fa-9efe-348a549106f1/encounterprovider/88cd0ac6-b670-493b-90ba-deaf5c4ded61?v=full',
          },
        ],
        resourceVersion: '1.9',
      },
    ],
    links: [
      {
        rel: 'self',
        uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/e4cd1b3e-c8dc-45fa-9efe-348a549106f1',
      },
    ],
    resourceVersion: '1.9',
  },
  {
    uuid: '45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
    display: 'Visit Note 11/01/2022',
    encounterDatetime: '2022-01-11T12:18:55.000+0000',
    patient: {
      uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
      display: '100GEJ - John Wilson',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
        },
      ],
    },
    location: null,
    form: {
      uuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      display: 'Visit Note',
      name: 'Visit Note',
      description: null,
      encounterType: {
        uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
        display: 'Visit Note',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
          },
        ],
      },
      version: '1.0',
      build: null,
      published: false,
      formFields: [],
      retired: false,
      resources: [],
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    encounterType: {
      uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
      display: 'Visit Note',
      name: 'Visit Note',
      description:
        'Encounter where a full or abbreviated examination is done, usually leading to a presumptive or confirmed diagnosis, recorded by the examining clinician.',
      retired: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79?v=full',
        },
      ],
      resourceVersion: '1.8',
    },
    obs: [
      {
        uuid: 'd85f9060-fe42-4016-b5d1-1416439ec865',
        display: 'Visit Diagnoses: Presumed diagnosis, Primary, Malaria',
        concept: {
          uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Visit Diagnoses',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2022-01-11T12:18:55.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: [
          {
            uuid: 'a02d2870-9db6-496f-a2e2-530c711acd25',
            display: 'Diagnosis certainty: Presumed diagnosis',
            concept: {
              uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis certainty',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-11T12:18:55.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'd85f9060-fe42-4016-b5d1-1416439ec865',
              display: 'Visit Diagnoses: Presumed diagnosis, Primary, Malaria',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/d85f9060-fe42-4016-b5d1-1416439ec865',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: null,
            order: null,
            encounter: {
              uuid: '45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
              display: 'Visit Note 11/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Presumed diagnosis',
              name: {
                display: 'Presumed diagnosis',
                uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Presumed diagnosis',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Presumed diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Impression clinique',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dyagnostik pwobab',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Diagnostic probable',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'The diagnosis is yet to be confirmed by special tests. This is the diagnosis based on clinical findings.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 410596003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Presumed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 1346',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159393',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/a02d2870-9db6-496f-a2e2-530c711acd25',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/a02d2870-9db6-496f-a2e2-530c711acd25?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: 'aa683081-37c0-4139-afab-f7e0391aa7a1',
            display: 'Diagnosis order: Primary',
            concept: {
              uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis order',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-11T12:18:55.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'd85f9060-fe42-4016-b5d1-1416439ec865',
              display: 'Visit Diagnoses: Presumed diagnosis, Primary, Malaria',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/d85f9060-fe42-4016-b5d1-1416439ec865',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: null,
            order: null,
            encounter: {
              uuid: '45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
              display: 'Visit Note 11/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Primary',
              name: {
                display: 'Primary',
                uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Primary',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Principal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Đầu',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primordial',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Prensipal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display: 'Primary, principal or first (as in qualifier for diagnosis)',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 63161005',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159943',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/aa683081-37c0-4139-afab-f7e0391aa7a1',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/aa683081-37c0-4139-afab-f7e0391aa7a1?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '5aefe9a5-7025-4ce7-ac05-7ea2fc3f13c3',
            display: 'PROBLEM LIST: Malaria',
            concept: {
              uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'PROBLEM LIST',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2022-01-11T12:18:55.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'd85f9060-fe42-4016-b5d1-1416439ec865',
              display: 'Visit Diagnoses: Presumed diagnosis, Primary, Malaria',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/d85f9060-fe42-4016-b5d1-1416439ec865',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: null,
            order: null,
            encounter: {
              uuid: '45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
              display: 'Visit Note 11/01/2022',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Malaria',
              name: {
                display: 'Malaria',
                uuid: '16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Malaria',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Diagnosis',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '130754BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Bệnh sốt rét',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/130754BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '83994BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Paludismo',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/83994BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malaria',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16603BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134406BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malarya',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134406BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '142032BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ملیریا',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/142032BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '16604BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Paludisme',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/16604BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134405BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malaria',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134405BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '142031BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'малярия',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/142031BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '4639FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'A protozoan disease caused by four species of the genus PLASMODIUM (P. falciparum (MALARIA, FALCIPARUM), P. vivax (MALARIA, VIVAX), P. ovale, and P. malariae) and transmitted by the bite of an infected female mosquito of the genus Anopheles. Malaria is endemic in parts of Asia, Africa, Central and South America, Oceania, and certain Caribbean islands. It is characterized by extreme exhaustion associated with paroxysms of high fever, sweating, shaking chills, and anemia.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/4639FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '88127ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-10-WHO: B54',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/88127ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '143612ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/143612ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134582ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'AMPATH: 906',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/134582ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '267991ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'IMO ProblemIT: 28660',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/267991ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '73619ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 61462000',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/73619ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '182724ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 116128',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/182724ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '285654ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICPC2: A73',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/285654ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '133986ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'AMPATH: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/133986ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '286848ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-11-WHO: 1F4Z',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/286848ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '144370ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH Malawi: 123',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/144370ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/116128AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/5aefe9a5-7025-4ce7-ac05-7ea2fc3f13c3',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/5aefe9a5-7025-4ce7-ac05-7ea2fc3f13c3?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
        ],
        comment: null,
        location: null,
        order: null,
        encounter: {
          uuid: '45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
          display: 'Visit Note 11/01/2022',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
            },
          ],
        },
        voided: false,
        value: null,
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/d85f9060-fe42-4016-b5d1-1416439ec865',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/d85f9060-fe42-4016-b5d1-1416439ec865?v=full',
          },
        ],
        resourceVersion: '1.11',
      },
    ],
    orders: [],
    voided: false,
    auditInfo: {
      creator: {
        uuid: '93ee734f-618a-4951-939d-872f6c4a7447',
        display: 'dennis',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/user/93ee734f-618a-4951-939d-872f6c4a7447',
          },
        ],
      },
      dateCreated: '2022-01-11T12:19:38.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    visit: null,
    encounterProviders: [
      {
        uuid: 'b8e81322-e3e2-444a-942c-c79e6a689eb9',
        provider: {
          uuid: '76e55303-21bc-445e-89dd-212998773247',
          display: '38-0 - Dennis Kigen',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/provider/76e55303-21bc-445e-89dd-212998773247',
            },
          ],
        },
        encounterRole: {
          uuid: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          display: 'Clinician',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounterrole/240b26f9-dd88-4172-823d-4a8bfeb7841f',
            },
          ],
        },
        voided: false,
        links: [
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/45ac2dc0-f285-45a3-a5cb-f365b0dceb15/encounterprovider/b8e81322-e3e2-444a-942c-c79e6a689eb9?v=full',
          },
        ],
        resourceVersion: '1.9',
      },
    ],
    links: [
      {
        rel: 'self',
        uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/45ac2dc0-f285-45a3-a5cb-f365b0dceb15',
      },
    ],
    resourceVersion: '1.9',
  },
  {
    uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
    display: 'Visit Note 08/09/2021',
    encounterDatetime: '2021-09-08T03:09:37.000+0000',
    patient: {
      uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
      display: '100GEJ - John Wilson',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
        },
      ],
    },
    location: {
      uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
      display: 'MTRH Module 4',
      name: 'MTRH Module 4',
      description: 'Ampath Facility',
      address1: 'Galapagosweg 91, Building A',
      address2: 'line 3',
      cityVillage: 'Den Burg',
      stateProvince: 'southern',
      country: 'NLD',
      postalCode: '9105 PZ',
      latitude: '42.25475478',
      longitude: '-83.6945691',
      countyDistrict: null,
      address3: 'line 4',
      address4: 'line 5',
      address5: null,
      address6: null,
      tags: [],
      parentLocation: {
        uuid: 'c9e8613f-1cc1-4769-81d7-318fe853c150',
        display: 'MTRH',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/c9e8613f-1cc1-4769-81d7-318fe853c150',
          },
        ],
      },
      childLocations: [],
      retired: false,
      attributes: [],
      address7: null,
      address8: null,
      address9: null,
      address10: null,
      address11: null,
      address12: null,
      address13: null,
      address14: null,
      address15: null,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc?v=full',
        },
      ],
      resourceVersion: '2.0',
    },
    form: {
      uuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      display: 'Visit Note',
      name: 'Visit Note',
      description: null,
      encounterType: {
        uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
        display: 'Visit Note',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
          },
        ],
      },
      version: '1.0',
      build: null,
      published: false,
      formFields: [],
      retired: false,
      resources: [],
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/form/c75f120a-04ec-11e3-8780-2b40bef9a44b?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    encounterType: {
      uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
      display: 'Visit Note',
      name: 'Visit Note',
      description:
        'Encounter where a full or abbreviated examination is done, usually leading to a presumptive or confirmed diagnosis, recorded by the examining clinician.',
      retired: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encountertype/d7151f82-c1f3-4152-a605-2f9ea7414a79?v=full',
        },
      ],
      resourceVersion: '1.8',
    },
    obs: [
      {
        uuid: 'ec5bd62a-38c6-4d03-b51c-4554468f3169',
        display: 'Visit Diagnoses: Primary, Presumed diagnosis, Malaria, confirmed',
        concept: {
          uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Visit Diagnoses',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2021-09-08T03:09:37.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: [
          {
            uuid: '3d12c806-bb89-4c16-a54e-77a29493ebc5',
            display: 'Diagnosis order: Primary',
            concept: {
              uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis order',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2021-09-08T03:09:37.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'ec5bd62a-38c6-4d03-b51c-4554468f3169',
              display: 'Visit Diagnoses: Primary, Presumed diagnosis, Malaria, confirmed',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ec5bd62a-38c6-4d03-b51c-4554468f3169',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
              display: 'MTRH Module 4',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
              display: 'Visit Note 08/09/2021',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Primary',
              name: {
                display: 'Primary',
                uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Primary',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Principal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107494BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Đầu',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/127621BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primordial',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134530BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107493BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Prensipal',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134531BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display: 'Primary, principal or first (as in qualifier for diagnosis)',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16472FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 63161005',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/137043ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159943',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/217084ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Primary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236982ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/3d12c806-bb89-4c16-a54e-77a29493ebc5',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/3d12c806-bb89-4c16-a54e-77a29493ebc5?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '604b4f8e-f13b-4b90-b78d-79b75cf9c29a',
            display: 'Diagnosis certainty: Presumed diagnosis',
            concept: {
              uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis certainty',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2021-09-08T03:09:37.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'ec5bd62a-38c6-4d03-b51c-4554468f3169',
              display: 'Visit Diagnoses: Primary, Presumed diagnosis, Malaria, confirmed',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ec5bd62a-38c6-4d03-b51c-4554468f3169',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
              display: 'MTRH Module 4',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
              display: 'Visit Note 08/09/2021',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Presumed diagnosis',
              name: {
                display: 'Presumed diagnosis',
                uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Presumed diagnosis',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Presumed diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Impression clinique',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dyagnostik pwobab',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Diagnostic probable',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'The diagnosis is yet to be confirmed by special tests. This is the diagnosis based on clinical findings.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 410596003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Presumed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 1346',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159393',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/604b4f8e-f13b-4b90-b78d-79b75cf9c29a',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/604b4f8e-f13b-4b90-b78d-79b75cf9c29a?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: 'db7e1d38-a22a-486f-b7d9-31ef9c87f58e',
            display: 'PROBLEM LIST: Malaria, confirmed',
            concept: {
              uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'PROBLEM LIST',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2021-09-08T03:09:37.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'ec5bd62a-38c6-4d03-b51c-4554468f3169',
              display: 'Visit Diagnoses: Primary, Presumed diagnosis, Malaria, confirmed',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ec5bd62a-38c6-4d03-b51c-4554468f3169',
                },
              ],
            },
            valueCodedName: {
              uuid: '107966BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              display: 'Malaria, confirmed',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107966BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                },
              ],
            },
            groupMembers: null,
            comment: null,
            location: {
              uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
              display: 'MTRH Module 4',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
              display: 'Visit Note 08/09/2021',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Malaria, confirmed',
              name: {
                display: 'Malaria, confirmed',
                uuid: '107966BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Malaria, confirmed',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107966BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107966BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Diagnosis',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '126352BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malaria confirmées',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/126352BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107966BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Malaria, confirmed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107966BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [],
              mappings: [
                {
                  uuid: '242519ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'IMO ProblemIT: 1527785',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/242519ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '285752ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICPC2: A73',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/285752ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '217284ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 160148',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/217284ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '143841ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 7127',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/143841ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '170552ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED NP: 61462000',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/170552ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '143842ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-10-WHO: B53.8',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/143842ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '170553ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED NP: 2931005',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/170553ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/db7e1d38-a22a-486f-b7d9-31ef9c87f58e',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/db7e1d38-a22a-486f-b7d9-31ef9c87f58e?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
        ],
        comment: null,
        location: {
          uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
          display: 'MTRH Module 4',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
            },
          ],
        },
        order: null,
        encounter: {
          uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
          display: 'Visit Note 08/09/2021',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
            },
          ],
        },
        voided: false,
        value: null,
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ec5bd62a-38c6-4d03-b51c-4554468f3169',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/ec5bd62a-38c6-4d03-b51c-4554468f3169?v=full',
          },
        ],
        resourceVersion: '1.11',
      },
      {
        uuid: '70fb26b6-78bf-4bb7-bea1-9d371a918759',
        display: 'Text of encounter note: Patient seems very unwell\r\n',
        concept: {
          uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Text of encounter note',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2021-09-08T03:09:37.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: null,
        comment: null,
        location: {
          uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
          display: 'MTRH Module 4',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
            },
          ],
        },
        order: null,
        encounter: {
          uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
          display: 'Visit Note 08/09/2021',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
            },
          ],
        },
        voided: false,
        value: 'Patient seems very unwell\r\n',
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/70fb26b6-78bf-4bb7-bea1-9d371a918759',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/70fb26b6-78bf-4bb7-bea1-9d371a918759?v=full',
          },
        ],
        resourceVersion: '1.11',
      },
      {
        uuid: 'f1381ba6-f876-4ca8-96c8-309127372b95',
        display: 'Visit Diagnoses: Secondary, Human immunodeficiency virus (HIV) disease, Presumed diagnosis',
        concept: {
          uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Visit Diagnoses',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
          ],
        },
        person: {
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
          display: '100GEJ - John Wilson',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
            },
          ],
        },
        obsDatetime: '2021-09-08T03:09:37.000+0000',
        accessionNumber: null,
        obsGroup: null,
        valueCodedName: null,
        groupMembers: [
          {
            uuid: 'c4e3a836-d188-4145-a1bc-67a4fe46cf5c',
            display: 'Diagnosis order: Secondary',
            concept: {
              uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis order',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2021-09-08T03:09:37.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f1381ba6-f876-4ca8-96c8-309127372b95',
              display: 'Visit Diagnoses: Secondary, Human immunodeficiency virus (HIV) disease, Presumed diagnosis',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1381ba6-f876-4ca8-96c8-309127372b95',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
              display: 'MTRH Module 4',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
              display: 'Visit Note 08/09/2021',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Secondary',
              name: {
                display: 'Secondary',
                uuid: '107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Secondary',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '134532BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Secondaire',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134532BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Secondary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107495BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134533BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dezyèm',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134533BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16473FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display: 'Second or non-primary qualifier value such as for a diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16473FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '236983ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Secondary',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236983ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '137044ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 2603003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/137044ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '217085ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159944',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/217085ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/c4e3a836-d188-4145-a1bc-67a4fe46cf5c',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/c4e3a836-d188-4145-a1bc-67a4fe46cf5c?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '692f513a-c744-4ced-bca1-d01e4186b7f5',
            display: 'PROBLEM LIST: Human immunodeficiency virus (HIV) disease',
            concept: {
              uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'PROBLEM LIST',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2021-09-08T03:09:37.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f1381ba6-f876-4ca8-96c8-309127372b95',
              display: 'Visit Diagnoses: Secondary, Human immunodeficiency virus (HIV) disease, Presumed diagnosis',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1381ba6-f876-4ca8-96c8-309127372b95',
                },
              ],
            },
            valueCodedName: {
              uuid: '38217BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
              display: 'Human immunodeficiency virus (HIV) disease',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/38217BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                },
              ],
            },
            groupMembers: null,
            comment: null,
            location: {
              uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
              display: 'MTRH Module 4',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
              display: 'Visit Note 08/09/2021',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Human immunodeficiency virus (HIV) disease',
              name: {
                display: 'Human immunodeficiency virus (HIV) disease',
                uuid: '38217BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Human immunodeficiency virus (HIV) disease',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/38217BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/38217BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
                  },
                ],
                resourceVersion: '1.9',
              },
              datatype: {
                uuid: '8d4a48b6-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Coded',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a48b6-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Diagnosis',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '38217BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Human immunodeficiency virus (HIV) disease',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/38217BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '66834BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'infección por virus de la inmunodeficiencia humana',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/66834BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '38218BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: "Virus de l'immunodéficience humaine",
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/38218BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '118226BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Humaan immunodeficiëntievirus-ziekte',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/118226BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '136492BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ANTIKÒ VIRIS IMINODEFISYANS',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/136492BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107471BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Human immunodeficiency virus (HIV) infection',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/107471BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [],
              mappings: [
                {
                  uuid: '253347ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'IMO ProblemIT: 300503',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/253347ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '199220ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 138405',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/199220ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '107352ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICD-10-WHO: B24',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/107352ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '153776ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: '3BT: 10044897',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/153776ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '253346ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'IMO ProblemIT: 598692',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/253346ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: 'a17c11ae-0411-37d7-bb8c-8312a9f838a8',
                  display: 'CIEL: 138405',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/a17c11ae-0411-37d7-bb8c-8312a9f838a8',
                    },
                  ],
                },
                {
                  uuid: '56284ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 86406008',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/56284ABBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '165536ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'ICPC2: B90',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/165536ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              answers: [
                {
                  uuid: '1067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Unknown',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    },
                  ],
                },
                {
                  uuid: '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'No',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    },
                  ],
                },
                {
                  uuid: '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Yes',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    },
                  ],
                },
              ],
              setMembers: [],
              attributes: [],
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/692f513a-c744-4ced-bca1-d01e4186b7f5',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/692f513a-c744-4ced-bca1-d01e4186b7f5?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
          {
            uuid: '4bc57d87-8271-477d-93f7-f6f2493b9e7b',
            display: 'Diagnosis certainty: Presumed diagnosis',
            concept: {
              uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diagnosis certainty',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
              ],
            },
            person: {
              uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
              display: '100GEJ - John Wilson',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
                },
              ],
            },
            obsDatetime: '2021-09-08T03:09:37.000+0000',
            accessionNumber: null,
            obsGroup: {
              uuid: 'f1381ba6-f876-4ca8-96c8-309127372b95',
              display: 'Visit Diagnoses: Secondary, Human immunodeficiency virus (HIV) disease, Presumed diagnosis',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1381ba6-f876-4ca8-96c8-309127372b95',
                },
              ],
            },
            valueCodedName: null,
            groupMembers: null,
            comment: null,
            location: {
              uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
              display: 'MTRH Module 4',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
                },
              ],
            },
            order: null,
            encounter: {
              uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
              display: 'Visit Note 08/09/2021',
              links: [
                {
                  rel: 'self',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
                },
              ],
            },
            voided: false,
            value: {
              uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Presumed diagnosis',
              name: {
                display: 'Presumed diagnosis',
                uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Presumed diagnosis',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  },
                  {
                    rel: 'full',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB?v=full',
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
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptdatatype/8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              conceptClass: {
                uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                display: 'Misc',
                links: [
                  {
                    rel: 'self',
                    uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f',
                  },
                ],
              },
              set: false,
              version: null,
              retired: false,
              names: [
                {
                  uuid: '106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Presumed diagnosis',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/106475BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Impression clinique',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134379BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Dyagnostik pwobab',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134385BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'Diagnostic probable',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/name/134378BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
              ],
              descriptions: [
                {
                  uuid: '16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                  display:
                    'The diagnosis is yet to be confirmed by special tests. This is the diagnosis based on clinical findings.',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/description/16025FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                    },
                  ],
                },
              ],
              mappings: [
                {
                  uuid: '132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'SNOMED CT: 410596003',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132795ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'org.openmrs.module.emrapi: Presumed',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/236985ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'PIH: 1346',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/132796ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                    },
                  ],
                },
                {
                  uuid: '216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                  display: 'CIEL: 159393',
                  links: [
                    {
                      rel: 'self',
                      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/mapping/216550ABBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
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
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                },
                {
                  rel: 'full',
                  uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=full',
                },
              ],
              resourceVersion: '2.0',
            },
            valueModifier: null,
            formFieldPath: null,
            formFieldNamespace: null,
            links: [
              {
                rel: 'self',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/4bc57d87-8271-477d-93f7-f6f2493b9e7b',
              },
              {
                rel: 'full',
                uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/4bc57d87-8271-477d-93f7-f6f2493b9e7b?v=full',
              },
            ],
            resourceVersion: '1.11',
          },
        ],
        comment: null,
        location: {
          uuid: '1675978f-4ee2-4b4a-a849-99029f9698fc',
          display: 'MTRH Module 4',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/1675978f-4ee2-4b4a-a849-99029f9698fc',
            },
          ],
        },
        order: null,
        encounter: {
          uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
          display: 'Visit Note 08/09/2021',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
            },
          ],
        },
        voided: false,
        value: null,
        valueModifier: null,
        formFieldPath: null,
        formFieldNamespace: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1381ba6-f876-4ca8-96c8-309127372b95',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/latestobs/f1381ba6-f876-4ca8-96c8-309127372b95?v=full',
          },
        ],
        resourceVersion: '1.11',
      },
    ],
    orders: [],
    voided: false,
    auditInfo: {
      creator: {
        uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
        display: 'admin',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          },
        ],
      },
      dateCreated: '2021-09-08T03:09:37.000+0000',
      changedBy: null,
      dateChanged: null,
    },
    visit: {
      uuid: 'f540da3a-b1e9-493e-9f24-12affd7e4f0d',
      display: 'Offline @ Laboratory - 08/09/2021 03:04',
      patient: {
        uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
        display: '100GEJ - John Wilson',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          },
        ],
      },
      visitType: {
        uuid: 'a22733fa-3501-4020-a520-da024eeff088',
        display: 'Offline',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visittype/a22733fa-3501-4020-a520-da024eeff088',
          },
        ],
      },
      indication: null,
      location: {
        uuid: '7fdfa2cb-bc95-405a-88c6-32b7673c0453',
        display: 'Laboratory',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/location/7fdfa2cb-bc95-405a-88c6-32b7673c0453',
          },
        ],
      },
      startDatetime: '2021-09-08T03:04:00.000+0000',
      stopDatetime: '2021-09-08T08:09:43.000+0000',
      encounters: [
        {
          uuid: 'd3bd542d-be6e-4d8b-939e-24d25b5490c2',
          display: 'Admission 08/09/2021',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/d3bd542d-be6e-4d8b-939e-24d25b5490c2',
            },
          ],
        },
        {
          uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
          display: 'Visit Note 08/09/2021',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
            },
          ],
        },
      ],
      attributes: [],
      voided: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visit/f540da3a-b1e9-493e-9f24-12affd7e4f0d',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/visit/f540da3a-b1e9-493e-9f24-12affd7e4f0d?v=full',
        },
      ],
      resourceVersion: '1.9',
    },
    encounterProviders: [
      {
        uuid: '94a13298-5a0b-4a2a-b9aa-d1457cc4ad71',
        provider: {
          uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
          display: 'UNKNOWN - User One',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/provider/f9badd80-ab76-11e2-9e96-0800200c9a66',
            },
          ],
        },
        encounterRole: {
          uuid: 'a0b03050-c99b-11e0-9572-0800200c9a66',
          display: 'Unknown',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounterrole/a0b03050-c99b-11e0-9572-0800200c9a66',
            },
          ],
        },
        voided: false,
        links: [
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0/encounterprovider/94a13298-5a0b-4a2a-b9aa-d1457cc4ad71?v=full',
          },
        ],
        resourceVersion: '1.9',
      },
    ],
    links: [
      {
        rel: 'self',
        uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/encounter/95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
      },
    ],
    resourceVersion: '1.9',
  },
];

export const mockVisitNotes = [
  {
    id: '1',
    diagnoses: 'Malaria, Primary respiratory tuberculosis, confirmed',
    encounterDate: '2022-01-27T16:51:29.000+0000',
    encounterNote:
      'Text of encounter note: Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos quae maiores dolorem assumenda odit quasi tenetur non optio harum error nam distinctio explicabo, hic veritatis iusto quibusdam architecto. Nulla, ipsum.\nLorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos quae maiores dolorem assumenda odit quasi tenetur non optio harum error nam distinctio explicabo, hic veritatis iusto quibusdam architecto. Nulla, ipsum.',
    encounterNoteRecordedAt: '2022-01-27T16:51:29.000+0000',
    encounterProvider: 'fcgbnyjyjmy - doc doctor',
    encounterProviderRole: 'Clinician',
  },
  {
    id: '2',
    diagnoses: 'Visit Diagnoses: Presumed diagnosis, Malaria, Primary',
    encounterDate: '2022-01-14T08:46:05.000+0000',
    encounterNote: '',
    encounterNoteRecordedAt: '',
    encounterProvider: 'fcgbnyjyjmy - doc doctor',
    encounterProviderRole: 'Clinician',
  },
  {
    id: '3',
    diagnoses: 'Visit Diagnoses: Presumed diagnosis, Hemorrhage in early pregnancy, Primary',
    encounterDate: '2022-01-14T08:42:22.000+0000',
    encounterNote: '',
    encounterNoteRecordedAt: '',
    encounterProvider: 'fcgbnyjyjmy - doc doctor',
    encounterProviderRole: 'Clinician',
  },
];

export const formattedVisitNotes = [
  {
    id: 0,
    encounterDate: '2022-01-27T16:51:29.000+0000',
    diagnoses: 'Malaria, Primary respiratory tuberculosis, confirmed',
  },
  {
    id: 1,
    encounterDate: '2022-01-14T08:46:05.000+0000',
    diagnoses: 'Malaria',
  },
  {
    id: 2,
    encounterDate: '2022-01-14T08:42:22.000+0000',
    diagnoses: 'Hemorrhage in early pregnancy',
  },
  {
    id: 3,
    encounterDate: '2022-01-11T12:18:55.000+0000',
    diagnoses: 'Malaria',
  },
  {
    id: 4,
    encounterDate: '2021-09-08T03:09:37.000+0000',
    diagnoses: 'Malaria, confirmed, Human immunodeficiency virus (HIV) disease',
  },
];
