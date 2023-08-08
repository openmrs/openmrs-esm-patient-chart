export const mockPatientEncounters = {
  data: {
    resourceType: 'Bundle',
    id: '857a8f14-5a4a-48a6-8427-a73b4756e6fa',
    status: null,
    meta: {
      lastUpdated: '2019-11-07T12:04:14.742',
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://localhost:8080/openmrs/ws/fhir/Encounter?_id=638591-9586-4b2b-a511-17bc1b79d1ba',
      },
    ],
    entry: [
      {
        fullUrl: 'http://localhost:8080/openmrs/ws/fhir/Encounter/638591-9586-4b2b-a511-17bc1b79d1ba',
        resource: {
          resourceType: 'Encounter',
          id: '638591-9586-4b2b-a511-17bc1b79d1ba',
          extension: [
            {
              url: 'http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created',
              valueDateTime: '2017-01-18T08:59:07',
            },
            {
              url: 'https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1',
              valueString: 'daemon8',
            },
            {
              url: 'dateChanged',
              valueDateTime: '2017-01-18T08:59:08',
            },
            {
              url: 'changedBy',
              valueString: 'daemon9',
            },
            {
              url: 'formUuid',
              valueString: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
            },
          ],
          status: 'finished',
          type: [
            {
              coding: [
                {
                  display: 'Vitals',
                  userSelected: false,
                },
              ],
            },
          ],
          subject: {
            id: '1e7e9782-2e97-44a0-ab2e-9d04498d4ca6',
            reference: 'Patient/1e7e9782-2e97-44a0-ab2e-9d04498d4ca6',
            display: 'Paul Walker(Identifier:10000X)',
          },
          period: {
            start: '2015-04-17T06:16:07',
            end: '2015-04-17T06:16:07',
          },
          location: [
            {
              location: {
                reference: 'Location/58c57d25-8d39-41ab-8422-108a0c277d98',
                display: 'Outpatient Clinic',
              },
              period: {
                start: '2015-04-17T06:16:07',
                end: '2019-11-09T06:16:07',
              },
            },
          ],
          partOf: {
            reference: 'Encounter/e1d45e08-4a2a-4bb1-accb-2181c3e25455',
            display: 'Facility Visit',
          },
        },
      },
      {
        fullUrl: 'http://localhost:8080/openmrs/ws/fhir/Encounter/11238591-9586-4b2b-a511-17bc1b79d1ba',
        resource: {
          resourceType: 'Encounter',
          id: '11238591-9586-4b2b-a511-17bc1b79d1ba',
          extension: [
            {
              url: 'http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created',
              valueDateTime: '2017-01-18T08:59:07',
            },
            {
              url: 'https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1',
              valueString: 'daemon10',
            },
            {
              url: 'dateChanged',
              valueDateTime: '2017-01-18T08:59:08',
            },
            {
              url: 'changedBy',
              valueString: 'daemon12',
            },
            {
              url: 'formUuid',
              valueString: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
            },
          ],
          status: 'finished',
          type: [
            {
              coding: [
                {
                  display: 'Vitals',
                  userSelected: false,
                },
              ],
            },
          ],
          subject: {
            id: '1e7e9782-2e97-44a0-ab2e-9d04498d4ca6',
            reference: 'Patient/1e7e9782-2e97-44a0-ab2e-9d04498d4ca6',
            display: 'Paul Walker(Identifier:10000X)',
          },
          period: {
            start: '2015-04-17T06:16:07',
            end: '2015-04-17T06:16:07',
          },
          location: [
            {
              location: {
                reference: 'Location/58c57d25-8d39-41ab-8422-108a0c277d98',
                display: 'Inpatient Clinic',
              },
              period: {
                start: '2015-04-17T06:16:07',
                end: '2019-04-17T06:16:07',
              },
            },
          ],
          partOf: {
            reference: 'Encounter/e1d45e08-4a2a-4bb1-accb-2181c3e25455',
            display: 'Facility Visit',
          },
        },
      },
      {
        fullUrl: 'http://localhost:8080/openmrs/ws/fhir/Encounter/24638591-9586-4b2b-a511-17bc1b79d1ba',
        resource: {
          resourceType: 'Encounter',
          id: '24638591-9586-4b2b-a511-17bc1b79d1ba',
          participant: [
            {
              individual: {
                reference: 'Practitioner/bf218490-1691-11df-97a5-7038c432aabf',
                display: 'Super User(Identifier:admin)',
              },
            },
          ],
          status: 'finished',
          type: [
            {
              coding: [
                {
                  display: 'Vitals',
                  userSelected: false,
                },
              ],
            },
          ],
          subject: {
            id: '1e7e9782-2e97-44a0-ab2e-9d04498d4ca6',
            reference: 'Patient/1e7e9782-2e97-44a0-ab2e-9d04498d4ca6',
            display: 'Paul Walker(Identifier:10000X)',
          },
          period: {
            start: '2015-04-17T06:16:07',
            end: '2015-04-17T06:16:07',
          },
          location: [
            {
              location: {
                reference: 'Location/58c57d25-8d39-41ab-8422-108a0c277d98',
                display: 'Turbo County Hospital',
              },
              period: {
                start: '2015-04-17T06:16:07',
                end: '2015-04-17T06:16:07',
              },
            },
          ],
          partOf: {
            reference: 'Encounter/e1d45e08-4a2a-4bb1-accb-2181c3e25455',
            display: 'Facility Visit',
          },
        },
      },
    ],
  },
};
