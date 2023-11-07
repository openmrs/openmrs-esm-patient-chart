import { Allergen } from '../allergies/allergies-form/allergy-form.resource';
import { AllergenType } from '../types';

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
  id: '17d21c4c-7248-4170-bcd8-ac4ee0146109',
  meta: { lastUpdated: '2021-05-24T12:44:20.131+00:00' },
  type: 'searchset',
  total: 5,
  link: [
    {
      relation: 'self',
      url: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/AllergyIntolerance?patient.identifier=100GEJ',
    },
  ],
  entry: [
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/AllergyIntolerance/2b8e9963-a734-4cb8-b778-68f8f360c321',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: '2b8e9963-a734-4cb8-b778-68f8f360c321',
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
        },
        patient: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        recordedDate: '2020-11-03T06:01:39+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
        note: [{ text: 'Comments' }],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Aspirin',
                },
              ],
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Mental status change',
                  },
                ],
              },
            ],
            severity: 'severe',
          },
        ],
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/AllergyIntolerance/b929af4c-497c-49cc-8fc0-15d11db0e8e8',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: 'b929af4c-497c-49cc-8fc0-15d11db0e8e8',
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
        },
        patient: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        recordedDate: '2020-11-03T06:02:25+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
        note: [{ text: 'Comments' }],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '80106AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Morphine',
                },
              ],
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Mental status change',
                  },
                ],
              },
            ],
            severity: 'severe',
          },
        ],
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/AllergyIntolerance/509bc6b5-b124-49a1-aa98-718787dda6cc',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: '509bc6b5-b124-49a1-aa98-718787dda6cc',

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
        },
        patient: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        recordedDate: '2021-01-22T11:12:25+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
        note: [{ text: 'Patient allergies have been noted down' }],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '162297AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Penicillins',
                },
              ],
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '142412AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Diarrhea',
                  },
                ],
              },
              {
                coding: [
                  {
                    code: '143264AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Cough',
                  },
                ],
              },
              {
                coding: [
                  {
                    code: '159347AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Musculoskeletal pain',
                  },
                ],
              },
              {
                coding: [
                  {
                    code: '121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Mental status change',
                  },
                ],
              },
              {
                coding: [
                  {
                    code: '148787AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Angioedema',
                  },
                ],
              },
            ],
            severity: 'severe',
          },
        ],
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/AllergyIntolerance/4704c1a8-5ecd-4cd6-b060-d9663f393551',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: '4704c1a8-5ecd-4cd6-b060-d9663f393551',
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
        },
        patient: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        recordedDate: '2021-04-29T05:57:54+00:00',
        recorder: {
          reference: 'Practitioner/0ae5c4d6-c9bc-4e85-9aeb-73ee4da98678',
          type: 'Practitioner',
          display: 'user-dev dev Developer',
        },
        note: [{ text: 'Some Comments' }],
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: '162546AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Fish',
                },
              ],
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Anaphylaxis',
                  },
                ],
              },
              {
                coding: [
                  {
                    code: '148787AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Angioedema',
                  },
                ],
              },
              {
                coding: [
                  {
                    code: '140238AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Fever',
                  },
                ],
              },
              {
                coding: [
                  {
                    code: '111061AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Hives',
                  },
                ],
              },
            ],
            severity: 'mild',
          },
        ],
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/AllergyIntolerance/ed330db7-6da6-40d3-b853-5c41a428464e',
      resource: {
        resourceType: 'AllergyIntolerance',
        id: 'ed330db7-6da6-40d3-b853-5c41a428464e',
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
        },
        patient: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        recordedDate: '2021-05-01T01:10:08+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
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
            },
            manifestation: [
              {
                coding: [
                  {
                    code: '148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    display: 'Anaphylaxis',
                  },
                ],
              },
            ],
            severity: 'moderate',
          },
        ],
      },
    },
  ],
};

export const mockAllergens: Allergen[] = [
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
