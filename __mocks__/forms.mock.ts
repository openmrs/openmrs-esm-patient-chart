export const mockForms = [
  {
    form: {
      uuid: '0a9fc16e-4c00-4842-a1e4-e4bafeb6e226',
      name: 'POC COVID 19 Assessment Form v1.1',
      display: 'POC COVID 19 Assessment Form v1.1',
      encounterType: {
        uuid: '466d6707-8429-4e61-b5a0-d63444f5ad35',
        name: 'COVIDSCREENING',
        viewPrivilege: null,
        editPrivilege: null,
      },
      version: '1.1',
      published: true,
      retired: false,
      resources: [
        {
          uuid: '44ef6954-c6f1-4cac-90b9-66b4b4c55c3a',
          name: 'JSON schema',
          dataType: 'AmpathJsonSchema',
          valueReference: '2e6295c6-3022-48d5-abd7-725dd3e22b6a',
        },
      ],
    },
    associatedEncounters: [
      {
        uuid: '30726a13-ac53-4b51-a1cb-91c410a70960',
        encounterDatetime: '2022-04-08T09:21:48.000+0300',
        encounterType: {
          uuid: '466d6707-8429-4e61-b5a0-d63444f5ad35',
          name: 'COVIDSCREENING',
          viewPrivilege: null,
          editPrivilege: null,
        },
        form: {
          uuid: '0a9fc16e-4c00-4842-a1e4-e4bafeb6e226',
          name: 'AMPATH POC COVID 19 Assessment Form v1.1',
          encounterType: {
            uuid: '466d6707-8429-4e61-b5a0-d63444f5ad35',
            name: 'COVIDSCREENING',
            viewPrivilege: null,
            editPrivilege: null,
          },
          version: '1.1',
          published: true,
          retired: false,
          resources: [
            {
              uuid: '44ef6954-c6f1-4cac-90b9-66b4b4c55c3a',
              name: 'JSON schema',
              dataType: 'AmpathJsonSchema',
              valueReference: '2e6295c6-3022-48d5-abd7-725dd3e22b6a',
            },
          ],
        },
      },
    ],
    lastCompleted: new Date('2022-04-08T06:21:48.000Z'),
  },
];

// export const mockPatientEncounters = [
//   {
//     uuid: '5859f098-45d6-4c4e-9447-53dd4032d7d7',
//     encounterDateTime: '2021-03-16T08:17:34.000Z',
//     encounterTypeUuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
//     encounterTypeName: 'Vitals',
//     form: {
//       uuid: 'c51b0cbe-32d8-4ea5-81d2-8f3ade30c2de',
//       name: 'POC Vitals v1.0',
//       published: true,
//       retired: false,
//       encounterTypeUuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
//       encounterTypeName: 'Vitals',
//       checked: true,
//     },
//   },
// ];
