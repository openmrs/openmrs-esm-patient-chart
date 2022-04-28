enum VisitMode {
  NEWVISIT = 'startVisit',
  EDITVISIT = 'editVisit',
  LOADING = 'loadingVisit',
}

enum VisitStatus {
  NOTSTARTED = 'notStarted',
  ONGOING = 'ongoing',
}

export const mockVisitTypes = [
  {
    uuid: 'some-uuid1',
    name: 'Outpatient Visit',
    display: 'Outpatient Visit',
  },
  {
    uuid: 'some-uuid2',
    name: 'HIV Return Visit',
    display: 'HIV Return Visit',
  },
];

export const mockVisitTypesDataResponse = {
  data: {
    results: mockVisitTypes,
  },
};

export const mockVisits = {
  data: {
    results: [
      {
        uuid: '15dd49ba-4283-472f-bce3-05401f85c0d3',
        patient: {
          uuid: '5a4e7a05-e275-4c14-acab-cb86f3e16353',
          display: '102EWH - Test Patient Registration',
        },
        visitType: {
          uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
          display: 'Facility Visit',
        },
        location: {
          uuid: '7fdfa2cb-bc95-405a-88c6-32b7673c0453',
          display: 'Laboratory',
        },
        startDatetime: '2020-07-28T10:29:00.000+0000',
        stopDatetime: '2020-07-29T10:29:00.000+0000',
        encounters: [],
      },
    ],
  },
};

export const mockCurrentVisit = {
  uuid: '17f512b4-d264-4113-a6fe-160cb38cb46e',
  encounters: [],
  patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
  visitType: {
    uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    name: 'Facility Visit',
    display: 'Facility Visit',
  },
  attributes: [],
  startDatetime: new Date('2021-03-16T08:16:00.000+0000'),
  stopDatetime: null,
  location: {
    uuid: '6351fcf4-e311-4a19-90f9-35667d99a8af',
    name: 'Registration Desk',
    display: 'Registration Desk',
  },
};

export const visitOverviewDetailMockData = {
  data: {
    results: [
      {
        uuid: '8e2f177c-8999-4fde-ba92-1e62b33179ac',
        encounters: [
          {
            uuid: 'c2f0d397-4f3e-486a-abc4-4565caa0f09c',
            encounterDatetime: '2021-08-25T15:18:54.000+0000',
            orders: [],
            obs: [
              {
                uuid: 'cfecc122-8527-44a0-8e95-0556dc377604',
                concept: {
                  uuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Pulse',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Pulse: 140.0',
                groupMembers: null,
                value: 140,
              },
              {
                uuid: 'eb5f8819-d641-4f32-b371-2954af689718',
                concept: {
                  uuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Arterial blood oxygen saturation (pulse oximeter)',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Arterial blood oxygen saturation (pulse oximeter): 89.0',
                groupMembers: null,
                value: 89,
              },
              {
                uuid: '1479d86c-41f2-49d4-8340-bfbd3c8f9902',
                concept: {
                  uuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Respiratory rate',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Respiratory rate: 35.0',
                groupMembers: null,
                value: 35,
              },
              {
                uuid: 'b13af9b2-9aef-488e-b844-e8e70bcd190a',
                concept: {
                  uuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Systolic',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Systolic: 80.0',
                groupMembers: null,
                value: 80,
              },
              {
                uuid: '56fc7429-6de6-44c0-87b3-4dee65c468e3',
                concept: {
                  uuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Diastolic',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Diastolic: 30.0',
                groupMembers: null,
                value: 30,
              },
              {
                uuid: '4815af36-28d2-41af-8c19-5a0e6226cb2e',
                concept: {
                  uuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Temperature (C)',
                  conceptClass: { uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f', display: 'Finding' },
                },
                display: 'Temperature (C): 40.0',
                groupMembers: null,
                value: 40,
              },
              {
                uuid: '4ec8fb5d-63c5-470d-9838-73668b2d951b',
                concept: {
                  uuid: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'General patient note',
                  conceptClass: { uuid: '8d491e50-c2cc-11de-8d13-0010c6dffd0f', display: 'Question' },
                },
                display: 'General patient note: Looks very unwell',
                groupMembers: null,
                value: 'Looks very unwell',
              },
            ],
            encounterType: { uuid: '67a71486-1a54-468f-ac3e-7091a9a79584', display: 'Vitals' },
            encounterProviders: [],
          },
        ],
        visitType: { uuid: 'e89b4b06-8d7a-40e6-b5ad-d3209f47040b', name: 'ECH', display: 'ECH' },
        startDatetime: '2021-08-18T10:59:00.000+0000',
      },
    ],
  },
};

export const visitOverviewDetailMockDataNotEmpty = {
  data: {
    results: [
      {
        uuid: 'f540da3a-b1e9-493e-9f24-12affd7e4f0d',
        encounters: [
          {
            uuid: 'd3bd542d-be6e-4d8b-939e-24d25b5490c2',
            encounterDatetime: '2021-09-08T03:13:32.000+0000',
            orders: [
              {
                uuid: 'b309f63d-8b4a-4860-b7b1-93ade0fe96e8',
                dateActivated: '2021-09-08T03:19:31.000+0000',
                drug: { uuid: 'fc92c351-8a85-41b9-95bf-a7dfea46c9cd', name: 'sulfadoxine', strength: '500mg' },
                doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
                dose: 1,
                route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
                frequency: { uuid: '160862OFAAAAAAAAAAAAAAA', display: 'Once daily' },
                duration: 5,
                durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
                numRefills: 2,
                orderType: { uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7', display: 'Drug Order' },
                orderer: {
                  uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
                  person: { uuid: 'e7dd932e-c2ac-4917-bf66-e59793adbd5f', display: 'Fifty User' },
                },
              },
              {
                uuid: '3f9ebe93-ba40-47dd-99b6-2c78e6e64464',
                dateActivated: '2021-09-08T03:21:08.000+0000',
                drug: { uuid: 'fc92c351-8a85-41b9-95bf-a7dfea46c9cd', name: 'sulfadoxine', strength: '500mg' },
                doseUnits: null,
                dose: null,
                route: null,
                frequency: null,
                duration: null,
                durationUnits: null,
                numRefills: null,
                orderType: { uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7', display: 'Drug Order' },
                orderer: {
                  uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
                  person: { uuid: 'e7dd932e-c2ac-4917-bf66-e59793adbd5f', display: 'Fifty User' },
                },
              },
              {
                uuid: 'e4c565cf-b9ee-4fbd-adce-6e188444f71f',
                dateActivated: '2021-09-08T03:19:31.000+0000',
                drug: { uuid: 'fc92c351-8a85-41b9-95bf-a7dfea46c9cd', name: 'sulfadoxine', strength: '500mg' },
                doseUnits: { uuid: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Tablet' },
                dose: 1,
                route: { uuid: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Oral' },
                frequency: { uuid: '160862OFAAAAAAAAAAAAAAA', display: 'Once daily' },
                duration: 5,
                durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
                numRefills: 2,
                orderType: { uuid: '131168f4-15f5-102d-96e4-000c29c2a5d7', display: 'Drug Order' },
                orderer: {
                  uuid: 'e89cae4a-3cb3-40a2-b964-8b20dda2c985',
                  person: { uuid: 'e7dd932e-c2ac-4917-bf66-e59793adbd5f', display: 'Fifty User' },
                },
              },
            ],
            obs: [],
            encounterType: { uuid: 'e22e39fd-7db2-45e7-80f1-60fa0d5a4378', display: 'Admission' },
            encounterProviders: [
              {
                uuid: '5171be48-bcfc-4f74-972c-4212db900dc0',
                display: 'Super User: Unknown',
                encounterRole: { uuid: 'a0b03050-c99b-11e0-9572-0800200c9a66', display: 'Admin' },
                provider: {
                  uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
                  person: { uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' },
                },
              },
            ],
          },
          {
            uuid: '95f6471b-9a65-4dc3-b6ab-0d8bd3299ff0',
            encounterDatetime: '2021-09-08T03:09:37.000+0000',
            orders: [],
            obs: [
              {
                uuid: 'ec5bd62a-38c6-4d03-b51c-4554468f3169',
                concept: {
                  uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Visit Diagnoses',
                  conceptClass: { uuid: '8d492594-c2cc-11de-8d13-0010c6dffd0f', display: 'ConvSet' },
                },
                display: 'Visit Diagnoses: Primary, Presumed diagnosis, Malaria, confirmed',
                groupMembers: [
                  {
                    uuid: '3d12c806-bb89-4c16-a54e-77a29493ebc5',
                    concept: { uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Diagnosis order' },
                    value: { uuid: '159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Primary' },
                  },
                  {
                    uuid: '604b4f8e-f13b-4b90-b78d-79b75cf9c29a',
                    concept: { uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Diagnosis certainty' },
                    value: { uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Presumed diagnosis' },
                  },
                  {
                    uuid: 'db7e1d38-a22a-486f-b7d9-31ef9c87f58e',
                    concept: { uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'PROBLEM LIST' },
                    value: { uuid: '160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Malaria, confirmed' },
                  },
                ],
                value: null,
              },
              {
                uuid: '70fb26b6-78bf-4bb7-bea1-9d371a918759',
                concept: {
                  uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Text of encounter note',
                  conceptClass: { uuid: '8d491e50-c2cc-11de-8d13-0010c6dffd0f', display: 'Question' },
                },
                display: 'Text of encounter note: Patient seems very unwell\r\n',
                groupMembers: null,
                value: 'Patient seems very unwell\r\n',
              },
              {
                uuid: 'f1381ba6-f876-4ca8-96c8-309127372b95',
                concept: {
                  uuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Visit Diagnoses',
                  conceptClass: { uuid: '8d492594-c2cc-11de-8d13-0010c6dffd0f', display: 'ConvSet' },
                },
                display: 'Visit Diagnoses: Secondary, HUMAN IMMUNODEFICIENCY VIRUS (HIV) DISEASE, Presumed diagnosis',
                groupMembers: [
                  {
                    uuid: 'c4e3a836-d188-4145-a1bc-67a4fe46cf5c',
                    concept: { uuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Diagnosis order' },
                    value: { uuid: '159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Secondary' },
                  },
                  {
                    uuid: '692f513a-c744-4ced-bca1-d01e4186b7f5',
                    concept: { uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'PROBLEM LIST' },
                    value: {
                      uuid: '138405AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      display: 'HUMAN IMMUNODEFICIENCY VIRUS (HIV) DISEASE',
                    },
                  },
                  {
                    uuid: '4bc57d87-8271-477d-93f7-f6f2493b9e7b',
                    concept: { uuid: '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Diagnosis certainty' },
                    value: { uuid: '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Presumed diagnosis' },
                  },
                ],
                value: null,
              },
            ],
            encounterType: { uuid: 'd7151f82-c1f3-4152-a605-2f9ea7414a79', display: 'Visit Note' },
            encounterProviders: [
              {
                uuid: '94a13298-5a0b-4a2a-b9aa-d1457cc4ad71',
                display: 'Super User: Unknown',
                encounterRole: { uuid: 'a0b03050-c99b-11e0-9572-0800200c9a66', display: 'Admin' },
                provider: {
                  uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
                  person: { uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' },
                },
              },
            ],
          },
        ],
        visitType: { uuid: 'a22733fa-3501-4020-a520-da024eeff088', name: 'Offline', display: 'Offline' },
        startDatetime: '2021-09-08T03:04:00.000+0000',
      },
    ],
  },
};

export const mockEncounters = [
  {
    id: '979d38e3-fb68-47cf-843f-2b0263690f49',
    datetime: '2022-01-18T16:25:27.000+0000',
    encounterType: 'Admission',
    form: {
      uuid: '17e3bc1a-d319-408f-8b57-73e367f7fa80',
      display: 'POC Consent Form',
    },
    obs: [],
    provider: '--',
    visitUuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    visitType: 'Facility Visit',
  },
  {
    id: '09eadbdd-6924-4126-8a3b-c92aac04b8e7',
    datetime: '2021-08-03T00:47:48.000+0000',
    encounterType: 'Visit Note',
    form: null,
    obs: [
      {
        uuid: 'a93ad7a9-66d8-4952-ae2e-82b59c8c5989',
        concept: {
          uuid: '1421AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Immunization history',
          conceptClass: {
            uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f',
            display: 'Finding',
          },
        },
        display: 'Immunization history: asd, 333, 2021-08-05, 2021-08-02, 1.0, ',
        groupMembers: null,
        value: null,
        obsDatetime: null,
      },
      {
        uuid: '914965f1-059a-4e16-956a-b3bb9781b12a',
        concept: {
          uuid: '1421AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Immunization history',
          conceptClass: {
            uuid: '8d491a9a-c2cc-11de-8d13-0010c6dffd0f',
            display: 'Finding',
          },
        },
        display: 'Immunization history: 2021-08-02, 333, asd, , 1.0, 2021-08-05',
        groupMembers: null,
        value: null,
      },
    ],
    provider: 'User One',
    visitUuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    visitType: 'Facility Visit',
  },
  {
    id: 'ff9a0035-8698-47dc-b608-bd6ec2646e5c',
    datetime: '2021-07-05T10:07:18.000+0000',
    encounterType: 'Visit Note',
    form: {
      uuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      display: 'Visit Note',
    },
    obs: [],
    provider: 'Dennis The Doctor',
    visitUuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    visitType: 'Facility Visit',
  },
];
