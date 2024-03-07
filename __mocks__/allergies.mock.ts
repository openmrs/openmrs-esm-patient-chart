enum AllergenType {
  DRUG = 'DRUG',
  FOOD = 'FOOD',
  ENVIRONMENT = 'ENVIRONMENT',
  OTHER = 'OTHER',
}

export const mockAllergyResult = {
  display: 'ACE inhibitors',
  uuid: 'dbba59ef-c8a5-4967-b20a-5761b1954f6d',
  allergen: {
    allergenType: 'DRUG',
    codedAllergen: {
      uuid: '162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'ACE inhibitors',
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
      ],
    },
    nonCodedAllergen: null,
  },
  severity: {
    uuid: '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Mild',
    links: [
      {
        rel: 'self',
        uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
    ],
  },
  comment: null,
  reactions: [
    {
      reaction: {
        uuid: '143264AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Cough',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/concept/143264AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
        ],
      },
      reactionNonCoded: null,
    },
  ],
  patient: {
    uuid: '011cffa0-7383-45ef-962c-d1976718b8d4',
    display: '103H22 - test test test',
    links: [
      {
        rel: 'self',
        uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/011cffa0-7383-45ef-962c-d1976718b8d4',
      },
    ],
  },
  links: [
    {
      rel: 'self',
      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/011cffa0-7383-45ef-962c-d1976718b8d4/allergy/dbba59ef-c8a5-4967-b20a-5761b1954f6d',
    },
    {
      rel: 'full',
      uri: 'http://localhost:8090/openmrslocalhost:8080/openmrs/ws/rest/v1/patient/011cffa0-7383-45ef-962c-d1976718b8d4/allergy/dbba59ef-c8a5-4967-b20a-5761b1954f6d?v=full',
    },
  ],
  resourceVersion: '1.8',
};

export const mockFhirAllergyIntoleranceResponse = {
  resourceType: 'Bundle',
  id: '4de79f04-276a-4db1-9a36-ef9772533cd3',
  meta: {
    lastUpdated: '2024-03-04T10:22:54.083+00:00',
    tag: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
        code: 'SUBSETTED',
        display: 'Resource encoded in summary mode',
      },
    ],
  },
  type: 'searchset',
  total: 6,
  link: [
    {
      relation: 'self',
      url: 'https://dev3.openmrs.org/openmrs/ws/fhir2/R4/AllergyIntolerance?_summary=data&patient=6c9d6265-5942-4da2-9f2b-7d23fd247859',
    },
  ],
  entry: [
    {
      fullUrl: 'https://dev3.openmrs.org/openmrs/ws/fhir2/R4/AllergyIntolerance/25dbb3d5-cf2b-4e6b-a44f-81a8a89edbc7',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: '25dbb3d5-cf2b-4e6b-a44f-81a8a89edbc7',
        meta: {
          versionId: '1709544197000',
          lastUpdated: '2024-03-04T09:23:17.000+00:00',
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
          text: 'Active',
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
              code: 'confirmed',
              display: 'Confirmed',
            },
          ],
          text: 'Confirmed',
        },
        type: 'allergy',
        category: ['medication'],
        criticality: 'high',
        code: {
          coding: [
            {
              code: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Aspirin',
            },
          ],
          text: 'Aspirin',
        },
        patient: {
          reference: 'Patient/6c9d6265-5942-4da2-9f2b-7d23fd247859',
          type: 'Patient',
          display: 'Joshua Test (OpenMRS ID: 1000NK1)',
        },
        recordedDate: '2024-03-04T09:23:17+00:00',
        recorder: {
          reference: 'Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f',
          type: 'Practitioner',
          display: 'Super User',
        },
        note: [
          {
            text: 'Comments',
          },
        ],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Aspirin',
                },
              ],
              text: 'Aspirin',
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Mental status change',
                  },
                ],
                text: 'Mental status change',
              },
            ],
            severity: 'severe',
          },
        ],
      },
    },
    {
      fullUrl: 'https://dev3.openmrs.org/openmrs/ws/fhir2/R4/AllergyIntolerance/46e378a7-3397-4922-b964-255177df413b',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: '46e378a7-3397-4922-b964-255177df413b',
        meta: {
          versionId: '1709544283000',
          lastUpdated: '2024-03-04T09:24:43.000+00:00',
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
          text: 'Active',
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
              code: 'confirmed',
              display: 'Confirmed',
            },
          ],
          text: 'Confirmed',
        },
        type: 'allergy',
        category: ['medication'],
        criticality: 'high',
        code: {
          coding: [
            {
              code: '80106AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Morphine',
            },
          ],
          text: 'Morphine',
        },
        patient: {
          reference: 'Patient/6c9d6265-5942-4da2-9f2b-7d23fd247859',
          type: 'Patient',
          display: 'Joshua Test (OpenMRS ID: 1000NK1)',
        },
        recordedDate: '2024-03-04T09:24:43+00:00',
        recorder: {
          reference: 'Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f',
          type: 'Practitioner',
          display: 'Super User',
        },
        note: [
          {
            text: 'Comments',
          },
        ],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '80106AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Morphine',
                },
              ],
              text: 'Morphine',
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Mental status change',
                  },
                ],
                text: 'Mental status change',
              },
            ],
            severity: 'severe',
          },
        ],
      },
    },
    {
      fullUrl: 'https://dev3.openmrs.org/openmrs/ws/fhir2/R4/AllergyIntolerance/cc4c8baf-abf3-41c9-b5f4-abf76eca2d2c',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: 'cc4c8baf-abf3-41c9-b5f4-abf76eca2d2c',
        meta: {
          versionId: '1709544486000',
          lastUpdated: '2024-03-04T09:28:06.000+00:00',
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
          text: 'Active',
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
              code: 'confirmed',
              display: 'Confirmed',
            },
          ],
          text: 'Confirmed',
        },
        type: 'allergy',
        category: ['medication'],
        criticality: 'high',
        code: {
          coding: [
            {
              code: '162297AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Penicillins',
            },
          ],
          text: 'Penicillins',
        },
        patient: {
          reference: 'Patient/6c9d6265-5942-4da2-9f2b-7d23fd247859',
          type: 'Patient',
          display: 'Joshua Test (OpenMRS ID: 1000NK1)',
        },
        recordedDate: '2024-03-04T09:28:06+00:00',
        recorder: {
          reference: 'Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f',
          type: 'Practitioner',
          display: 'Super User',
        },
        note: [
          {
            text: 'Patient allergies have been noted down',
          },
        ],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '162297AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Penicillins',
                },
              ],
              text: 'Penicillins',
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Mental status change',
                  },
                ],
                text: 'Mental status change',
              },
              {
                coding: [
                  {
                    code: '148787AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Angioedema',
                  },
                ],
                text: 'Angioedema',
              },
              {
                coding: [
                  {
                    code: '143264AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Cough',
                  },
                ],
                text: 'Cough',
              },
              {
                coding: [
                  {
                    code: '142412AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Diarrhea',
                  },
                ],
                text: 'Diarrhea',
              },
              {
                coding: [
                  {
                    code: '159347AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Musculoskeletal pain',
                  },
                ],
                text: 'Musculoskeletal pain',
              },
            ],
            severity: 'severe',
          },
        ],
      },
    },
    {
      fullUrl: 'https://dev3.openmrs.org/openmrs/ws/fhir2/R4/AllergyIntolerance/c80bcc21-1222-4a00-a14a-5fc4d12fd213',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: 'c80bcc21-1222-4a00-a14a-5fc4d12fd213',
        meta: {
          versionId: '1709544648000',
          lastUpdated: '2024-03-04T09:30:48.000+00:00',
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
          text: 'Active',
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
              code: 'confirmed',
              display: 'Confirmed',
            },
          ],
          text: 'Confirmed',
        },
        type: 'allergy',
        category: ['food'],
        criticality: 'low',
        code: {
          coding: [
            {
              code: '162546AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Fish',
            },
          ],
          text: 'Fish',
        },
        patient: {
          reference: 'Patient/6c9d6265-5942-4da2-9f2b-7d23fd247859',
          type: 'Patient',
          display: 'Joshua Test (OpenMRS ID: 1000NK1)',
        },
        recordedDate: '2024-03-04T09:30:48+00:00',
        recorder: {
          reference: 'Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f',
          type: 'Practitioner',
          display: 'Super User',
        },
        note: [
          {
            text: 'Some Comments',
          },
        ],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '162546AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Fish',
                },
              ],
              text: 'Fish',
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Anaphylaxis',
                  },
                ],
                text: 'Anaphylaxis',
              },
              {
                coding: [
                  {
                    code: '148787AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Angioedema',
                  },
                ],
                text: 'Angioedema',
              },
              {
                coding: [
                  {
                    code: '140238AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Fever',
                  },
                ],
                text: 'Fever',
              },
              {
                coding: [
                  {
                    code: '111061AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Hives',
                  },
                ],
                text: 'Hives',
              },
            ],
            severity: 'mild',
          },
        ],
      },
    },
    {
      fullUrl: 'https://dev3.openmrs.org/openmrs/ws/fhir2/R4/AllergyIntolerance/95ba9a38-3fd5-42c1-82c7-f2f5945da9b8',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: '95ba9a38-3fd5-42c1-82c7-f2f5945da9b8',
        meta: {
          versionId: '1709544728000',
          lastUpdated: '2024-03-04T09:32:08.000+00:00',
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
          text: 'Active',
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
              code: 'confirmed',
              display: 'Confirmed',
            },
          ],
          text: 'Confirmed',
        },
        type: 'allergy',
        category: ['medication'],
        criticality: 'unable-to-assess',
        code: {
          coding: [
            {
              code: '162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'ACE inhibitors',
            },
          ],
          text: 'ACE inhibitors',
        },
        patient: {
          reference: 'Patient/6c9d6265-5942-4da2-9f2b-7d23fd247859',
          type: 'Patient',
          display: 'Joshua Test (OpenMRS ID: 1000NK1)',
        },
        recordedDate: '2024-03-04T09:32:08+00:00',
        recorder: {
          reference: 'Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f',
          type: 'Practitioner',
          display: 'Super User',
        },
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'ACE inhibitors',
                },
              ],
              text: 'ACE inhibitors',
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Anaphylaxis',
                  },
                ],
                text: 'Anaphylaxis',
              },
            ],
            severity: 'moderate',
          },
        ],
      },
    },
    {
      fullUrl: 'https://dev3.openmrs.org/openmrs/ws/fhir2/R4/AllergyIntolerance/ceb07cd6-7df3-49b7-b448-6a8282472352',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: 'ceb07cd6-7df3-49b7-b448-6a8282472352',
        meta: {
          versionId: '1709547772000',
          lastUpdated: '2024-03-04T10:22:52.000+00:00',
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
          text: 'Active',
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
              code: 'confirmed',
              display: 'Confirmed',
            },
          ],
          text: 'Confirmed',
        },
        type: 'allergy',
        criticality: 'high',
        code: {
          coding: [
            {
              code: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Other',
            },
            {
              system: 'https://cielterminology.org',
              code: '5622',
            },
            {
              system: 'http://snomed.info/sct/',
              code: '74964007',
            },
          ],
          text: 'non-coded allergen',
        },
        patient: {
          reference: 'Patient/6c9d6265-5942-4da2-9f2b-7d23fd247859',
          type: 'Patient',
          display: 'Joshua Test (OpenMRS ID: 1000NK1)',
        },
        recordedDate: '2024-03-04T10:22:52+00:00',
        recorder: {
          reference: 'Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f',
          type: 'Practitioner',
          display: 'Super User',
        },
        note: [
          {
            text: 'non coded allergic note',
          },
        ],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Other',
                },
                {
                  system: 'https://cielterminology.org',
                  code: '5622',
                },
                {
                  system: 'http://snomed.info/sct/',
                  code: '74964007',
                },
              ],
              text: 'non-coded allergen',
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Other',
                  },
                  {
                    system: 'https://cielterminology.org',
                    code: '5622',
                  },
                  {
                    system: 'http://snomed.info/sct/',
                    code: '74964007',
                  },
                ],
                text: 'non-coded allergic reaction',
              },
            ],
            severity: 'severe',
          },
        ],
      },
    },
  ],
};

export const mockAllergens = [
  { uuid: '162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'ACE inhibitors', type: AllergenType.DRUG },
  {
    uuid: '162299AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'ARBs (angiotensin II receptor blockers)',
    type: AllergenType.DRUG,
  },
  { uuid: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Aspirin', type: AllergenType.DRUG },
  { uuid: '162543AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Beef', type: AllergenType.FOOD },
  { uuid: '72609AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Caffeine', type: AllergenType.FOOD },
  { uuid: '162544AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Chocolate', type: AllergenType.FOOD },
  { uuid: '162545AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Dairy food', type: AllergenType.FOOD },
  { uuid: '162171AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Eggs', type: AllergenType.FOOD },
  { uuid: '162536AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Bee stings', type: AllergenType.ENVIRONMENT },
  { uuid: '162537AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Dust', type: AllergenType.ENVIRONMENT },
  { uuid: '162538AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Latex', type: AllergenType.ENVIRONMENT },
];

export const mockAllergicReactions = [
  { uuid: '121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Mental status change' },
  { uuid: '121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Anaemia' },
  { uuid: '148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Anaphylaxis' },
  { uuid: '139084AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Headache' },
  { uuid: '148787AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Angioedema' },
  { uuid: '108AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Bronchospasm' },
  { uuid: '120148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Arrhythmia' },
  { uuid: '143264AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Cough' },
  { uuid: '142412AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Diarrhea' },
  { uuid: '118773AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Dystonia' },
  { uuid: '140238AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Fever' },
  { uuid: '140039AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Flushing' },
  { uuid: '139581AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'GI upset' },
  { uuid: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Hypertension' },
  { uuid: '136455AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Itching' },
  { uuid: '159347AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Musculoskeletal pain' },
  { uuid: '121AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Myalgia' },
  { uuid: '512AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Rash' },
  { uuid: '159098AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Hepatotoxicity' },
  { uuid: '111061AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Hives' },
  { uuid: '1067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Unknown' },
  { uuid: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Other' },
];

export const mockAllergies = [
  {
    id: 'ed330db7-6da6-40d3-b853-5c41a428464e',
    clinicalStatus: 'Active',
    criticality: 'unable-to-assess',
    display: 'ACE inhibitors',
    recordedDate: '2021-05-01T01:10:08+00:00',
    recordedBy: 'Super User',
    recorderType: 'Practitioner',
    reactionManifestations: ['Anaphylaxis'],
    reactionSeverity: 'Moderate',
  },
  {
    id: '4704c1a8-5ecd-4cd6-b060-d9663f393551',
    clinicalStatus: 'Active',
    criticality: 'low',
    display: 'Fish',
    recordedDate: '2021-04-29T05:57:54+00:00',
    recordedBy: 'user-dev dev Developer',
    recorderType: 'Practitioner',
    note: 'Some Comments',
    reactionManifestations: ['Anaphylaxis', 'Angioedema', 'Fever', 'Hives'],
    reactionSeverity: 'Mild',
  },
  {
    id: '509bc6b5-b124-49a1-aa98-718787dda6cc',
    clinicalStatus: 'Active',
    criticality: 'high',
    display: 'Penicillins',
    recordedDate: '2021-01-22T11:12:25+00:00',
    recordedBy: 'Super User',
    recorderType: 'Practitioner',
    note: 'Patient Allerries have been noted down',
    reactionManifestations: ['Diarrhea', 'Cough', 'Musculoskeletal pain', 'Mental status change', 'Angioedema'],
    reactionSeverity: 'Severe',
  },
  {
    id: 'b929af4c-497c-49cc-8fc0-15d11db0e8e8',
    clinicalStatus: 'Active',
    criticality: 'high',
    display: 'Morphine',
    recordedDate: '2020-11-03T06:02:25+00:00',
    recordedBy: 'Super User',
    recorderType: 'Practitioner',
    note: 'Comments',
    reactionManifestations: ['Mental status change'],
    reactionSeverity: 'Severe',
  },
  {
    id: '2b8e9963-a734-4cb8-b778-68f8f360c321',
    clinicalStatus: 'Active',
    criticality: 'high',
    display: 'Aspirin',
    recordedDate: '2020-11-03T06:01:39+00:00',
    recordedBy: 'Super User',
    recorderType: 'Practitioner',
    note: 'Comments',
    reactionManifestations: ['Mental status change'],
    reactionSeverity: 'Severe',
  },
];

export const mockAllergy = {
  clinicalStatus: 'Active',
  criticality: 'high',
  display: 'ACE inhibitors',
  id: 'acf497ae-1f75-436c-ad27-b8a0dec390cd',
  lastUpdated: '2024-02-28T11:41:58.000+00:00',
  note: 'sample allergy note',
  reactionManifestations: ['Anaphylaxis', 'Headache'],
  reactionSeverity: undefined,
  reactionToSubstance: undefined,
  recordedBy: 'Super User',
  recordedDate: '2024-02-23T13:45:08+00:00',
  recorderType: 'Practitioner',
};
