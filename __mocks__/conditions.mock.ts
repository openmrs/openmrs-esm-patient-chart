import type { Condition } from '../packages/esm-patient-conditions-app/src/conditions/conditions.resource';

export const mockFhirConditionsResponse = {
  resourceType: 'Bundle',
  id: 'da5b65d7-4e14-407d-9655-6207ef755b8a',
  meta: { lastUpdated: '2021-06-19T18:45:43.047+00:00' },
  type: 'searchset',
  total: 8,
  link: [
    {
      relation: 'self',
      url: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition?patient.identifier=100GEJ',
    },
  ],
  entry: [
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition/f4ee2cfe-3880-4ea2-a5a6-82aa8a0f6389',
      resource: {
        resourceType: 'Condition',
        id: 'f4ee2cfe-3880-4ea2-a5a6-82aa8a0f6389',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>f4ee2cfe-3880-4ea2-a5a6-82aa8a0f6389</td></tr><tr><td>Clinical Status:</td><td> Active </td></tr><tr><td>Code:</td><td> Hypertension </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Onset:</td><td> 19 August 2020 00:00:00 </td></tr><tr><td>Recorded Date:</td><td>19/08/2020</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002">Super User</a></td></tr></tbody></table></div>',
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
        },
        code: {
          coding: [
            {
              code: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Hypertension',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        onsetDateTime: '2020-08-19T00:00:00+00:00',
        recordedDate: '2020-08-19T18:34:48+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition/b1bc2101-e322-4bbe-a651-200bd0d4e1ad',
      resource: {
        resourceType: 'Condition',
        id: 'b1bc2101-e322-4bbe-a651-200bd0d4e1ad',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>b1bc2101-e322-4bbe-a651-200bd0d4e1ad</td></tr><tr><td>Clinical Status:</td><td> Inactive </td></tr><tr><td>Code:</td><td> Hypertension </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Onset:</td><td> 01 July 2020 00:00:00 </td></tr><tr><td>Recorded Date:</td><td>19/08/2020</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002">Super User</a></td></tr></tbody></table></div>',
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'inactive',
              display: 'Inactive',
            },
          ],
        },
        code: {
          coding: [
            {
              code: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Hypertension',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        onsetDateTime: '2020-07-01T00:00:00+00:00',
        recordedDate: '2020-08-19T18:35:08+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition/e3a3f9e2-73fe-4793-a2eb-0b4fcd00b271',
      resource: {
        resourceType: 'Condition',
        id: 'e3a3f9e2-73fe-4793-a2eb-0b4fcd00b271',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>e3a3f9e2-73fe-4793-a2eb-0b4fcd00b271</td></tr><tr><td>Clinical Status:</td><td> Active </td></tr><tr><td>Code:</td><td> Hypertension </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Onset:</td><td> 19 August 2020 00:00:00 </td></tr><tr><td>Recorded Date:</td><td>19/08/2020</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002">Super User</a></td></tr></tbody></table></div>',
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
        },
        code: {
          coding: [
            {
              code: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Hypertension',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        onsetDateTime: '2020-08-19T00:00:00+00:00',
        recordedDate: '2020-08-19T18:42:10+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition/08c4dbcb-b474-4843-8e62-7096ff6dd6a2',
      resource: {
        resourceType: 'Condition',
        id: '08c4dbcb-b474-4843-8e62-7096ff6dd6a2',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>08c4dbcb-b474-4843-8e62-7096ff6dd6a2</td></tr><tr><td>Clinical Status:</td><td> Active </td></tr><tr><td>Code:</td><td> Hypertension </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Onset:</td><td> 19 August 2020 00:00:00 </td></tr><tr><td>Recorded Date:</td><td>19/08/2020</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002">Super User</a></td></tr></tbody></table></div>',
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
        },
        code: {
          coding: [
            {
              code: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Hypertension',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        onsetDateTime: '2020-08-19T00:00:00+00:00',
        recordedDate: '2020-08-19T18:42:25+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition/c1006bd4-0b21-4305-9eba-c9c647534502',
      resource: {
        resourceType: 'Condition',
        id: 'c1006bd4-0b21-4305-9eba-c9c647534502',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>c1006bd4-0b21-4305-9eba-c9c647534502</td></tr><tr><td>Clinical Status:</td><td> Active </td></tr><tr><td>Code:</td><td> Anaemia </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Onset:</td><td> 27 January 2021 00:00:00 </td></tr><tr><td>Recorded Date:</td><td>28/01/2021</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002">Super User</a></td></tr></tbody></table></div>',
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
        },
        code: {
          coding: [
            {
              code: '121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Anaemia',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        onsetDateTime: '2021-01-27T00:00:00+00:00',
        recordedDate: '2021-01-28T09:09:27+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition/9479e872-c9ca-48cc-82ee-273d67c41187',
      resource: {
        resourceType: 'Condition',
        id: '9479e872-c9ca-48cc-82ee-273d67c41187',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>9479e872-c9ca-48cc-82ee-273d67c41187</td></tr><tr><td>Clinical Status:</td><td> Active </td></tr><tr><td>Code:</td><td> Malaria sevère </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Onset:</td><td> 27 January 2021 00:00:00 </td></tr><tr><td>Recorded Date:</td><td>28/01/2021</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002">Super User</a></td></tr></tbody></table></div>',
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
        },
        code: {
          coding: [
            {
              code: '160155AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Malaria sevère',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        onsetDateTime: '2021-01-27T00:00:00+00:00',
        recordedDate: '2021-01-28T09:09:27+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition/b648963a-8258-4131-a7fc-257f2a347435',
      resource: {
        resourceType: 'Condition',
        id: 'b648963a-8258-4131-a7fc-257f2a347435',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>b648963a-8258-4131-a7fc-257f2a347435</td></tr><tr><td>Clinical Status:</td><td> Active </td></tr><tr><td>Code:</td><td> Malaria, confirmed </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Onset:</td><td> 04 May 2021 21:00:00 </td></tr><tr><td>Recorded Date:</td><td>05/05/2021</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/0ae5c4d6-c9bc-4e85-9aeb-73ee4da98678">user-dev dev Developer</a></td></tr></tbody></table></div>',
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
        },
        code: {
          coding: [
            {
              code: '160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Malaria, confirmed',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        onsetDateTime: '2021-05-04T21:00:00+00:00',
        recordedDate: '2021-05-05T10:09:33+00:00',
        recorder: {
          reference: 'Practitioner/0ae5c4d6-c9bc-4e85-9aeb-73ee4da98678',
          type: 'Practitioner',
          display: 'user-dev dev Developer',
        },
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Condition/cbffbb42-41b4-4c38-bc14-842ef675df85',
      resource: {
        resourceType: 'Condition',
        id: 'cbffbb42-41b4-4c38-bc14-842ef675df85',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>cbffbb42-41b4-4c38-bc14-842ef675df85</td></tr><tr><td>Clinical Status:</td><td> Active </td></tr><tr><td>Code:</td><td> HIV Positive </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Onset:</td><td> 15 May 2021 21:00:00 </td></tr><tr><td>Recorded Date:</td><td>17/05/2021</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002">Super User</a></td></tr></tbody></table></div>',
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
        },
        code: {
          coding: [
            {
              code: '138571AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'HIV Positive',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        onsetDateTime: '2021-05-15T21:00:00+00:00',
        recordedDate: '2021-05-17T07:07:43+00:00',
        recorder: {
          reference: 'Practitioner/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          type: 'Practitioner',
          display: 'Super User',
        },
      },
    },
  ],
};

export const mockConditions: Array<Condition> = [
  {
    clinicalStatus: 'active',
    conceptId: '138571AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'HIV Positive',
    onsetDateTime: '2021-05-15T21:00:00+00:00',
    recordedDate: '2021-05-17T07:07:43+00:00',
    id: 'cbffbb42-41b4-4c38-bc14-842ef675df85',
  },
  {
    clinicalStatus: 'active',
    conceptId: '160148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Malaria, confirmed',
    onsetDateTime: '2021-05-04T21:00:00+00:00',
    recordedDate: '2021-05-05T10:09:33+00:00',
    id: 'b648963a-8258-4131-a7fc-257f2a347435',
  },
  {
    clinicalStatus: 'active',
    conceptId: '160155AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Malaria sevère',
    onsetDateTime: '2021-01-27T00:00:00+00:00',
    recordedDate: '2021-01-28T09:09:27+00:00',
    id: '9479e872-c9ca-48cc-82ee-273d67c41187',
  },
  {
    clinicalStatus: 'active',
    conceptId: '121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Anaemia',
    onsetDateTime: '2021-01-27T00:00:00+00:00',
    recordedDate: '2021-01-28T09:09:27+00:00',
    id: 'c1006bd4-0b21-4305-9eba-c9c647534502',
  },
  {
    clinicalStatus: 'active',
    conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Hypertension',
    onsetDateTime: '2020-08-19T00:00:00+00:00',
    recordedDate: '2020-08-19T18:42:25+00:00',
    id: '08c4dbcb-b474-4843-8e62-7096ff6dd6a2',
  },
];

export const searchedCondition = [
  {
    display: 'Headache',
    concept: {
      uuid: '139084AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Headache',
    },
    conceptName: {
      uuid: '38867BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      display: 'Headache',
    },
  },
];
