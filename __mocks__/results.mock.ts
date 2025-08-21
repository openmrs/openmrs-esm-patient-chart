import { ObsRecord } from '../packages/esm-patient-tests-app/src/types';

export const mockPanelData = {
  isLoading: false,
  conceptData: {},
  panels: [
    {
      resourceType: 'Observation',
      id: '29c6587f-0342-49eb-8849-da5b7d76d3a6',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            code: '679AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Red blood cells',
          },
          {
            system: 'http://loinc.org',
            code: '23859-2',
          },
          {
            system: 'https://cielterminology.org',
            code: '679',
          },
          {
            system: 'http://snomed.info/sct/',
            code: '14089001',
          },
        ],
        text: 'Red blood cells',
      },
      reference: 'Patient/b6b227cb-b906-45c8-961e-4fb564bc0aaf',
      type: 'Patient',
      display: 'Michelle Lewis (OpenMRS ID: 100010X)',
      encounter: {
        reference: 'Encounter/f7dd682d-f468-4d4a-953b-cdef192e5808',
        type: 'Encounter',
      },
      effectiveDateTime: '2023-10-30T21:41:55+00:00',
      issued: '2024-11-05T21:44:00.000+00:00',
      valueQuantity: {
        value: 5.9,
        unit: '10^6/uL',
        system: 'http://unitsofmeasure.org',
        code: '10^6/uL',
      },
      referenceRange: [
        {
          low: {
            value: 4,
          },
          high: {
            value: 6.1,
          },
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                code: 'normal',
              },
            ],
          },
        },
        {
          low: {
            value: 2.3,
          },
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                code: 'treatment',
              },
            ],
          },
        },
        {
          low: {
            value: 0,
          },
          type: {
            coding: [
              {
                system: 'http://fhir.openmrs.org/ext/obs/reference-range',
                code: 'absolute',
              },
            ],
          },
        },
      ],
      conceptUuid: '679AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      value: '5.9',
      name: 'Red blood cells',
      relatedObs: [],
    },
    {
      resourceType: 'Observation',
      id: '27746dee-0a77-4d35-a383-a3bce387546f',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            code: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Hematocrit',
          },
          {
            system: 'http://loinc.org',
            code: '20570-8',
          },
          {
            system: 'https://cielterminology.org',
            code: '1015',
          },
          {
            system: 'http://snomed.info/sct/',
            code: '365616005',
          },
        ],
        text: 'Hematocrit',
      },
      encounter: {
        reference: 'Encounter/a6ecb1ec-ea4d-49ec-a5eb-e58f8b9bd375',
        type: 'Encounter',
      },
      effectiveDateTime: '2023-05-17T03:30:55+00:00',
      issued: '2024-11-05T21:43:59.000+00:00',
      valueQuantity: {
        value: 46,
        unit: '%',
        system: 'http://unitsofmeasure.org',
        code: '%',
      },
      referenceRange: [
        {
          low: {
            value: 32.3,
          },
          high: {
            value: 51.9,
          },
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                code: 'normal',
              },
            ],
          },
        },
        {
          low: {
            value: 21,
          },
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                code: 'treatment',
              },
            ],
          },
        },
        {
          low: {
            value: 0,
          },
          high: {
            value: 100,
          },
          type: {
            coding: [
              {
                system: 'http://fhir.openmrs.org/ext/obs/reference-range',
                code: 'absolute',
              },
            ],
          },
        },
      ],
      conceptUuid: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      value: '46',
      name: 'Hematocrit',
      relatedObs: [],
    },
  ] as ObsRecord[],
  groupedObservations: {
    '679AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': [
      {
        resourceType: 'Observation',
        id: '29c6587f-0342-49eb-8849-da5b7d76d3a6',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'Laboratory',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '679AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Red blood cells',
            },
            {
              system: 'http://loinc.org',
              code: '23859-2',
            },
            {
              system: 'https://cielterminology.org',
              code: '679',
            },
            {
              system: 'http://snomed.info/sct/',
              code: '14089001',
            },
          ],
          text: 'Red blood cells',
        },
        subject: {
          reference: 'Patient/b6b227cb-b906-45c8-961e-4fb564bc0aaf',
          type: 'Patient',
          display: 'Michelle Lewis (OpenMRS ID: 100010X)',
        },
        encounter: {
          reference: 'Encounter/f7dd682d-f468-4d4a-953b-cdef192e5808',
          type: 'Encounter',
        },
        effectiveDateTime: '2023-10-30T21:41:55+00:00',
        issued: '2024-11-05T21:44:00.000+00:00',
        valueQuantity: {
          value: 5.9,
          unit: '10^6/uL',
          system: 'http://unitsofmeasure.org',
          code: '10^6/uL',
        },
        referenceRange: [
          {
            low: {
              value: 4,
            },
            high: {
              value: 6.1,
            },
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'normal',
                },
              ],
            },
          },
          {
            low: {
              value: 2.3,
            },
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'treatment',
                },
              ],
            },
          },
          {
            low: {
              value: 0,
            },
            type: {
              coding: [
                {
                  system: 'http://fhir.openmrs.org/ext/obs/reference-range',
                  code: 'absolute',
                },
              ],
            },
          },
        ],
        conceptUuid: '679AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        value: '5.9',
        name: 'Red blood cells',
        relatedObs: [],
      },
    ],
    '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': [
      {
        resourceType: 'Observation',
        id: '27746dee-0a77-4d35-a383-a3bce387546f',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'Laboratory',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Hematocrit',
            },
            {
              system: 'http://loinc.org',
              code: '20570-8',
            },
            {
              system: 'https://cielterminology.org',
              code: '1015',
            },
            {
              system: 'http://snomed.info/sct/',
              code: '365616005',
            },
          ],
          text: 'Hematocrit',
        },
        subject: {
          reference: 'Patient/b6b227cb-b906-45c8-961e-4fb564bc0aaf',
          type: 'Patient',
          display: 'Michelle Lewis (OpenMRS ID: 100010X)',
        },
        encounter: {
          reference: 'Encounter/a6ecb1ec-ea4d-49ec-a5eb-e58f8b9bd375',
          type: 'Encounter',
        },
        effectiveDateTime: '2023-05-17T03:30:55+00:00',
        issued: '2024-11-05T21:43:59.000+00:00',
        valueQuantity: {
          value: 46,
          unit: '%',
          system: 'http://unitsofmeasure.org',
          code: '%',
        },
        referenceRange: [
          {
            low: {
              value: 32.3,
            },
            high: {
              value: 51.9,
            },
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'normal',
                },
              ],
            },
          },
          {
            low: {
              value: 21,
            },
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'treatment',
                },
              ],
            },
          },
          {
            low: {
              value: 0,
            },
            high: {
              value: 100,
            },
            type: {
              coding: [
                {
                  system: 'http://fhir.openmrs.org/ext/obs/reference-range',
                  code: 'absolute',
                },
              ],
            },
          },
        ],
        conceptUuid: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        value: '46',
        name: 'Hematocrit',
        relatedObs: [],
      },
    ],
  } as unknown as Record<string, ObsRecord[]>,
};

export const mockResults = [
  {
    display: 'All Orderable Tests',
    subSets: [
      {
        display: 'Complete blood count',
        subSets: [
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Hematocrit',
            conceptUuid: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 32.3,
            hiAbsolute: 100,
            units: '%',
            lowCritical: 21,
            hiNormal: 51.9,
            flatName: 'Hematology-Complete blood count-Hematocrit',
            hasData: false,
            range: '32.3 – 51.9',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Haemoglobin',
            conceptUuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 10.4,
            units: 'g/dL',
            lowCritical: 7,
            hiNormal: 17.8,
            flatName: 'Hematology-Complete blood count-Haemoglobin',
            hasData: false,
            range: '10.4 – 17.8',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Mean cell hemoglobin concentration',
            conceptUuid: '1017AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 33,
            units: 'g/dL',
            hiNormal: 37,
            flatName: 'Hematology-Complete blood count-Mean cell hemoglobin concentration',
            hasData: false,
            range: '33 – 37',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Mean corpuscular hemoglobin',
            conceptUuid: '1018AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 26,
            units: 'pg',
            hiNormal: 34,
            flatName: 'Hematology-Complete blood count-Mean corpuscular hemoglobin',
            hasData: false,
            range: '26 – 34',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Mean corpuscular volume',
            conceptUuid: '851AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 80,
            units: 'fL',
            hiNormal: 100,
            flatName: 'Hematology-Complete blood count-Mean corpuscular volume',
            hasData: false,
            range: '80 – 100',
          },
          {
            obs: [
              {
                obsDatetime: '2024-11-04 05:48:00.0',
                value: '56.0',
                interpretation: 'LOW',
              },
            ],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Platelets',
            conceptUuid: '729AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 134,
            units: '10^3/mL',
            lowCritical: 49,
            hiNormal: 419,
            flatName: 'Hematology-Complete blood count-Platelets',
            hasData: true,
            range: '134 – 419',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Red blood cells',
            conceptUuid: '679AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 4,
            units: '10^6/uL',
            lowCritical: 2.3,
            hiNormal: 6.1,
            flatName: 'Hematology-Complete blood count-Red blood cells',
            hasData: false,
            range: '4 – 6.1',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Red cell distribution width',
            conceptUuid: '1016AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 10,
            units: '%',
            hiNormal: 20,
            flatName: 'Hematology-Complete blood count-Red cell distribution width',
            hasData: false,
            range: '10 – 20',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'White blood cells',
            conceptUuid: '678AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 4,
            units: '10^3/uL',
            lowCritical: 1.4,
            hiNormal: 11,
            flatName: 'Hematology-Complete blood count-White blood cells',
            hasData: false,
            range: '4 – 11',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Neutrophils (%) - microscopic exam',
            conceptUuid: '1336AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            hiAbsolute: 100,
            units: '%',
            flatName: 'Hematology-Complete blood count-Neutrophils (%) - microscopic exam',
            hasData: false,
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Lymphocytes (%) - microscopic exam',
            conceptUuid: '1338AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            hiAbsolute: 100,
            units: '%',
            flatName: 'Hematology-Complete blood count-Lymphocytes (%) - microscopic exam',
            hasData: false,
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Combined % of monocytes, eosinophils and basophils',
            conceptUuid: '163426AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 1,
            hiAbsolute: 50,
            units: '%',
            hiNormal: 10,
            flatName: 'Hematology-Complete blood count-Combined % of monocytes, eosinophils and basophils',
            hasData: false,
            range: '1 – 10',
          },
        ],
        flatName: 'Hematology-Complete blood count',
        hasData: true,
      },
      {
        display: 'Prothrombin Time (with INR)',
        subSets: [
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'International normalized ratio',
            conceptUuid: '161482AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 0.8,
            hiNormal: 1.2,
            hiCritical: 4,
            flatName: 'Hematology-Prothrombin Time (with INR)-International normalized ratio',
            hasData: false,
            range: '0.8 – 1.2',
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Prothrombin time',
            conceptUuid: '161481AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            units: 'Minute',
            flatName: 'Hematology-Prothrombin Time (with INR)-Prothrombin time',
            hasData: false,
          },
        ],
        flatName: 'Hematology-Prothrombin Time (with INR)',
        hasData: false,
      },
      {
        display: 'Sickling test only',
        subSets: [
          {
            obs: [],
            datatype: 'Coded',
            display: 'Sickle cell screening test',
            conceptUuid: '160225AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            flatName: 'Hematology-Sickling test only-Sickle cell screening test',
            hasData: false,
          },
        ],
        flatName: 'Hematology-Sickling test only',
        hasData: false,
      },
      {
        display: 'Lipid panel',
        subSets: [
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Total cholesterol (mmol/L)',
            conceptUuid: '1006AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            units: 'mmol/L',
            hiNormal: 5.17,
            flatName: 'Hematology-Lipid panel-Total cholesterol (mmol/L)',
            hasData: false,
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'High-density lipoprotein cholesterol measurement (mmol/L)',
            conceptUuid: '1007AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            lowNormal: 0.91,
            units: 'mmol/L',
            flatName: 'Hematology-Lipid panel-High-density lipoprotein cholesterol measurement (mmol/L)',
            hasData: false,
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Low-density lipoprotein cholesterol (mmol/L)',
            conceptUuid: '1008AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            units: 'mmol/L',
            hiNormal: 2.59,
            flatName: 'Hematology-Lipid panel-Low-density lipoprotein cholesterol (mmol/L)',
            hasData: false,
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Very low density lipoprotein measurement (mmol/L)',
            conceptUuid: '1298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            units: 'mmol/L',
            flatName: 'Hematology-Lipid panel-Very low density lipoprotein measurement (mmol/L)',
            hasData: false,
          },
          {
            obs: [],
            datatype: 'Numeric',
            lowAbsolute: 0,
            display: 'Triglycerides (mmol/L)',
            conceptUuid: '1009AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            units: 'mmol/L',
            hiNormal: 2.26,
            flatName: 'Hematology-Lipid panel-Triglycerides (mmol/L)',
            hasData: false,
          },
        ],
        flatName: 'Hematology-Lipid panel',
        hasData: false,
      },
    ],
    flatName: 'All Orderable Tests',
    hasData: true,
  },
];
