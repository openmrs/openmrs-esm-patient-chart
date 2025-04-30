export const mockGroupedResults = {
  timelineData: {
    data: {
      parsedTime: {
        yearColumns: [
          {
            year: '2024',
            size: 1,
          },
          {
            year: '2023',
            size: 1,
          },
        ],
        dayColumns: [
          {
            day: '31 — May',
            year: '2024',
            size: 1,
          },
          {
            day: '09 — Nov',
            year: '2023',
            size: 1,
          },
        ],
        timeColumns: ['01:39 AM', '11:15 PM'],
        sortedTimes: ['2024-05-31 01:39:03.0', '2023-11-09 23:15:03.0'],
      },
      rowData: [
        {
          obs: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '261.9',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '21.5',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
          datatype: 'Numeric',
          lowAbsolute: 0,
          display: 'Total bilirubin',
          conceptUuid: '655AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          units: 'umol/L',
          flatName: 'Bloodwork-Chemistry-Serum chemistry panel-Total bilirubin',
          hasData: true,
          entries: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '261.9',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '21.5',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
        },
        {
          obs: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '3.8',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '2.9',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
          datatype: 'Numeric',
          lowAbsolute: 0,
          display: 'Serum glutamic-pyruvic transaminase',
          conceptUuid: '654AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          lowNormal: 0,
          units: 'IU/L',
          hiNormal: 35,
          flatName: 'Bloodwork-Chemistry-Serum chemistry panel-Serum glutamic-pyruvic transaminase',
          hasData: true,
          range: '0 – 35',
          entries: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '3.8',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '2.9',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
        },
        {
          obs: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '27.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '27.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
          datatype: 'Numeric',
          lowAbsolute: 0,
          display: 'Serum glutamic-oxaloacetic transaminase',
          conceptUuid: '653AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          lowNormal: 25,
          units: 'IU/L',
          hiNormal: 45,
          flatName: 'Bloodwork-Chemistry-Serum chemistry panel-Serum glutamic-oxaloacetic transaminase',
          hasData: true,
          range: '25 – 45',
          entries: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '27.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '27.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
        },
        {
          obs: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '19.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '40.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
          datatype: 'Numeric',
          display: 'Alkaline phosphatase',
          conceptUuid: '785AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          lowNormal: 0,
          units: 'U/L',
          hiNormal: 270,
          hiCritical: 541,
          flatName: 'Bloodwork-Chemistry-Serum chemistry panel-Alkaline phosphatase',
          hasData: true,
          range: '0 – 270',
          entries: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '19.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '40.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
        },
        {
          obs: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '240.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '23.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
          datatype: 'Numeric',
          lowAbsolute: 0,
          display: 'Total protein',
          conceptUuid: '717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          units: 'g/dL',
          flatName: 'Bloodwork-Chemistry-Serum chemistry panel-Total protein',
          hasData: true,
          entries: [
            {
              obsDatetime: '2024-05-31 01:39:03.0',
              value: '240.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
            {
              obsDatetime: '2023-11-09 23:15:03.0',
              value: '23.0',
              interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
            },
          ],
        },
      ],
      panelName: 'timeline',
    },
    loaded: true,
  },
  parents: {
    'Hematology-Complete blood count': [],
    'Hematology-Prothrombin Time (with INR)': [],
    'Hematology-Sickling test only': [],
    'Hematology-Lipid panel': [],
    Hematology: [],
    'Bloodwork-Hematology-Complete blood count': [],
    'Bloodwork-Hematology-Prothrombin Time (with INR)': [],
    'Bloodwork-Hematology-Sickling test only': [],
    'Bloodwork-Hematology-Lipid panel': [],
    'Bloodwork-Hematology': [],
    'Bloodwork-Chemistry-Serum chemistry panel': [
      'Bloodwork-Chemistry-Serum chemistry panel-Total bilirubin',
      'Bloodwork-Chemistry-Serum chemistry panel-Serum glutamic-pyruvic transaminase',
      'Bloodwork-Chemistry-Serum chemistry panel-Serum glutamic-oxaloacetic transaminase',
      'Bloodwork-Chemistry-Serum chemistry panel-Alkaline phosphatase',
      'Bloodwork-Chemistry-Serum chemistry panel-Total protein',
    ],
    'Bloodwork-Chemistry-Comprehensive metabolic panel': [],
    'Bloodwork-Chemistry-Renal function panel': [],
    'Bloodwork-Chemistry-Basic metabolic panel': [],
    'Bloodwork-Chemistry': [
      'Bloodwork-Chemistry-Serum chemistry panel-Total bilirubin',
      'Bloodwork-Chemistry-Serum chemistry panel-Serum glutamic-pyruvic transaminase',
      'Bloodwork-Chemistry-Serum chemistry panel-Serum glutamic-oxaloacetic transaminase',
      'Bloodwork-Chemistry-Serum chemistry panel-Alkaline phosphatase',
      'Bloodwork-Chemistry-Serum chemistry panel-Total protein',
    ],
    Bloodwork: [
      'Bloodwork-Chemistry-Serum chemistry panel-Total bilirubin',
      'Bloodwork-Chemistry-Serum chemistry panel-Serum glutamic-pyruvic transaminase',
      'Bloodwork-Chemistry-Serum chemistry panel-Serum glutamic-oxaloacetic transaminase',
      'Bloodwork-Chemistry-Serum chemistry panel-Alkaline phosphatase',
      'Bloodwork-Chemistry-Serum chemistry panel-Total protein',
    ],
    'HIV viral load': [],
  },
  tableData: [
    {
      key: 'HIV viral load',
      date: '2024-05-31',
      flatName: 'HIV viral load',
      entries: [
        {
          obsDatetime: '2024-05-31 01:39:03.0',
          value: '261.9',
          interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
        },
      ],
    },
    {
      key: 'Bloodwork-Chemistry-Serum chemistry panel',
      date: '2024-05-31',
      flatName: 'Bloodwork-Chemistry-Serum chemistry panel',
      entries: [
        {
          obsDatetime: '2024-05-31 01:39:03.0',
          value: '261.9',
          interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
        },
      ],
    }
  ],
  activeTests: [],
  lowestParents: [
    {
      flatName: 'Hematology-Complete blood count',
      display: 'Complete blood count',
    },
    {
      flatName: 'Hematology-Prothrombin Time (with INR)',
      display: 'Prothrombin Time (with INR)',
    },
    {
      flatName: 'Hematology-Sickling test only',
      display: 'Sickling test only',
    },
    {
      flatName: 'Hematology-Lipid panel',
      display: 'Lipid panel',
    },
    {
      flatName: 'Bloodwork-Hematology-Complete blood count',
      display: 'Complete blood count',
    },
    {
      flatName: 'Bloodwork-Hematology-Prothrombin Time (with INR)',
      display: 'Prothrombin Time (with INR)',
    },
    {
      flatName: 'Bloodwork-Hematology-Sickling test only',
      display: 'Sickling test only',
    },
    {
      flatName: 'Bloodwork-Hematology-Lipid panel',
      display: 'Lipid panel',
    },
    {
      flatName: 'Bloodwork-Chemistry-Serum chemistry panel',
      display: 'Serum chemistry panel',
    },
    {
      flatName: 'Bloodwork-Chemistry-Renal function panel',
      display: 'Renal function panel',
    },
    {
      flatName: 'Bloodwork-Chemistry-Basic metabolic panel',
      display: 'Basic metabolic panel',
    },
    {
      flatName: 'HIV viral load',
      display: 'HIV viral load',
    },
  ],
};

type OBSERVATION_INTERPRETATION =
  | 'NORMAL'
  | 'HIGH'
  | 'CRITICALLY_HIGH'
  | 'OFF_SCALE_HIGH'
  | 'LOW'
  | 'CRITICALLY_LOW'
  | 'OFF_SCALE_LOW'
  | '--';
