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

export const mockPatientEncountersRESTAPI = {
  results: [
    {
      uuid: '0926163e-8a28-43c2-a2cf-9851dc72f39d',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2019-11-09T06:16:07',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Outpatient Clinic',
        name: 'Outpatient Clinic',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
          display: 'daemon',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
            },
          ],
        },
        dateCreated: '2020-01-13T21:40:38.000+0000',
        changedBy: {
          uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
          display: 'daemon',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
            },
          ],
        },
        dateChanged: '2020-01-14T01:10:35.000+0000',
      },
    },
    {
      uuid: 'd4765d6f-f0e9-4be9-ab23-294708d4e076',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-01-14T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'admin',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: 'd4765d6f-f0e9-4be9-ab23-294708d4e0767',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-01-14T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '0926163e-8a28-43c2-a2cf-9851dc72f39d2',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2019-11-12T06:16:07',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Outpatient2 Clinic',
        name: 'Outpatient2 Clinic',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
          display: 'daemon3',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
            },
          ],
        },
        dateCreated: '2020-01-13T21:40:38.000+0000',
        changedBy: {
          uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
          display: 'daemon4',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
            },
          ],
        },
        dateChanged: '2020-01-14T01:10:35.000+0000',
      },
    },
    {
      uuid: 'd4765d6f-f0e9-4be9-ab23-294708d4e0764',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-01-15T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'admin',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: 'd4765d6f-f0e9-4be9-ab23-294708d4e07674',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-01-19T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '0926163e-8a28-43c2-a2cf-9851dc72f39dg',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2019-08-09T06:16:07',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Outpatient3 Clinic',
        name: 'Outpatient3 Clinic',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
          display: 'daemon6',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
            },
          ],
        },
        dateCreated: '2020-01-13T21:40:38.000+0000',
        changedBy: {
          uuid: '285f67ce-3d8b-4733-96e5-1e2235e8e804',
          display: 'daemon7',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/285f67ce-3d8b-4733-96e5-1e2235e8e804',
            },
          ],
        },
        dateChanged: '2020-01-14T01:10:35.000+0000',
      },
    },
    {
      uuid: 'd4765d6f-f0e9-4be9-ab23-294708d4e07653',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-06-14T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'admin',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: 'd4765d6f-f0e9-4be9-ab23-294708d4e0767u1',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-14T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '1',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward11',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '2',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-21T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward12',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '3',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '4',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '5',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '6',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '7',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '8',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '9',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '10',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '11',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '12',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '13',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '14',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
    {
      uuid: '15',
      display: 'Vitals 14/01/2020',
      encounterDatetime: '2020-03-20T00:20:00.000+0000',
      location: {
        uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        display: 'Inpatient Ward1',
        name: 'Inpatient Ward',
      },
      encounterType: {
        name: 'Vitals',
        uuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
      },
      auditInfo: {
        creator: {
          uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
          display: 'SUPER USER(IDENTIFIER:ADMIN)',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/user/45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
            },
          ],
        },
        dateCreated: '2020-02-03T09:10:32.000+0000',
        changedBy: null,
        dateChanged: null,
      },
    },
  ],
};

export const formattedNotes = [
  {
    id: '0926163e-8a28-43c2-a2cf-9851dc72f39d',
    encounterDate: '2019-11-09T06:16:07',
    encounterType: 'Vitals',
    encounterLocation: 'Outpatient Clinic',
  },
  {
    id: 'd4765d6f-f0e9-4be9-ab23-294708d4e076',
    encounterDate: '2020-01-14T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward',
  },
  {
    id: 'd4765d6f-f0e9-4be9-ab23-294708d4e0767',
    encounterDate: '2020-01-14T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward',
  },
  {
    id: '0926163e-8a28-43c2-a2cf-9851dc72f39d2',
    encounterDate: '2019-11-12T06:16:07',
    encounterType: 'Vitals',
    encounterLocation: 'Outpatient2 Clinic',
  },
  {
    id: 'd4765d6f-f0e9-4be9-ab23-294708d4e0764',
    encounterDate: '2020-01-15T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward',
  },
  {
    id: 'd4765d6f-f0e9-4be9-ab23-294708d4e07674',
    encounterDate: '2020-01-19T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward',
  },
  {
    id: '0926163e-8a28-43c2-a2cf-9851dc72f39dg',
    encounterDate: '2019-08-09T06:16:07',
    encounterType: 'Vitals',
    encounterLocation: 'Outpatient3 Clinic',
  },
  {
    id: 'd4765d6f-f0e9-4be9-ab23-294708d4e07653',
    encounterDate: '2020-06-14T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward',
  },
  {
    id: 'd4765d6f-f0e9-4be9-ab23-294708d4e0767u1',
    encounterDate: '2020-03-14T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward',
  },
  {
    id: '1',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward11',
  },
  {
    id: '2',
    encounterDate: '2020-03-21T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward12',
  },
  {
    id: '3',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '4',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '5',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '6',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '7',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '8',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '9',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '10',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '11',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '12',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '13',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '14',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
  {
    id: '15',
    encounterDate: '2020-03-20T00:20:00.000+0000',
    encounterType: 'Vitals',
    encounterLocation: 'Inpatient Ward1',
  },
];
