export const mockRelationships = {
  data: {
    resourceType: 'Bundle',
    id: '5901aa07-ff18-4255-b050-7e1f4e82e9ed',
    meta: { lastUpdated: '2019-11-08T11:41:08.782+00:00' },
    type: 'searchset',
    total: 2,
    entry: [
      {
        fullUrl: 'http://localhost:8080/openmrs/ws/fhir/RelatedPerson/f9845d52-35ad-4031-81d5-b62a1a9c4984',
        resource: {
          resourceType: 'RelatedPerson',
          id: 'f9845d52-35ad-4031-81d5-b62a1a9c4984',
          extension: [
            {
              url: 'http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created',
              valueDateTime: '2019-11-05T08:34:57+00:00',
            },
            {
              url: 'https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1',
              valueString: 'jdenning',
            },
          ],
          identifier: [{ id: '83ad0a03-7c4a-4d89-8c53-57cf1f15718a' }],
          active: true,
          patient: {
            id: 'adc4e0fc-c1b8-49a8-adf2-a7c304d56cd7',
            reference: 'Patient/adc4e0fc-c1b8-49a8-adf2-a7c304d56cd7',
            identifier: { id: 'adc4e0fc-c1b8-49a8-adf2-a7c304d56cd7' },
            display: 'Joshua Johnson(Identifier:1002D2)',
          },
          relationship: {
            coding: [
              {
                system: 'http://openmrs.org',
                code: 'Doctor',
              },
            ],
          },
          name: [
            {
              id: 'a0ec6ff2-e29a-4d26-b19d-e62f643a2c72',
              use: 'usual',
              family: 'Okoro',
              given: ['Michael'],
            },
          ],
        },
      },
      {
        fullUrl: 'http://localhost:8080/openmrs/ws/fhir/RelatedPerson/0151ecec-4d32-451b-b7ad-6bb50e6433dd',
        resource: {
          resourceType: 'RelatedPerson',
          id: 'f9845d52-35ad-4031-81d5-bgvhbjnkmgh984',
          extension: [
            {
              url: 'http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created',
              valueDateTime: '2019-11-05T08:34:57+00:00',
            },
            {
              url: 'https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1',
              valueString: 'jdenning',
            },
          ],
          identifier: [{ id: '83ad0a03-7c4a-4d89-8c53-57cf1f15718a' }],
          active: true,
          patient: {
            id: 'adc4e0fc-c1b8-49a8-adf2-a7c304d56cd7',
            reference: 'Patient/adc4e0fc-c1b8-49a8-adf2-a7c304d56cd7',
            identifier: { id: 'adc4e0fc-c1b8-49a8-adf2-a7c304d56cd7' },
            display: 'Joshua Johnson(Identifier:1002D2)',
          },
          relationship: {
            coding: [
              {
                system: 'http://openmrs.org',
                code: 'Parent',
              },
            ],
          },
          name: [
            {
              id: 'a0ec6ff2-e29a-4d26-b19d-e62f643a2c72',
              use: 'usual',
              family: 'Monica',
              given: ['Mannet'],
            },
          ],
        },
      },
    ],
  },
};
