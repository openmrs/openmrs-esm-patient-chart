export const mockVitalsResponse = {
  headers: null,
  ok: true,
  redirected: true,
  status: 200,
  statusText: "ok",
  trailer: null,
  type: null,
  url: "",
  clone: null,
  body: null,
  bodyUsed: null,
  arrayBuffer: null,
  blob: null,
  formData: null,
  json: null,
  text: null,
  data: {
    resourceType: "Bundle",
    id: "63378630-e9a5-468b-baec-439d8ed55d09",
    meta: { lastUpdated: "2019-11-20T11:16:11.030+00:00" },
    type: "searchset",
    total: 10,
    link: [
      {
        relation: "self",
        url:
          "http://localhost:8080/openmrs/ws/fhir/Observation?code=5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&subject%3APatient=90f7f0b4-06a8-4a97-9678-e7a977f4b518"
      }
    ],
    entry: [
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/1413f560-ce7d-4cf8-9969-ceacc155f503",
        resource: {
          resourceType: "Observation",
          id: "1413f560-ce7d-4cf8-9969-ceacc155f503",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:37+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://ciel.org", code: "5087" },
              { system: "http://ampath.com/", code: "5087" },
              { system: "http://loinc.org", code: "8867-4" },
              { system: "http://snomed.info/sct", code: "78564009" },
              { system: "org.openmrs.module.mdrtb", code: "PULSE" },
              { system: "http://www.pih.org/", code: "5087" },
              {
                system: "http://openmrs.org",
                code: "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Pulse"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/c8876e57-f788-47a1-b8fd-30dbbb497941"
          },
          effectiveDateTime: "2016-05-16T06:13:36+00:00",
          issued: "2016-05-16T06:13:36.000+00:00",
          valueQuantity: {
            value: 22,
            unit: "beats/min",
            system: "http://unitsofmeasure.org",
            code: "beats/min"
          },
          referenceRange: [
            {
              low: {
                value: 0,
                unit: "beats/min",
                system: "http://unitsofmeasure.org",
                code: "beats/min"
              },
              high: {
                value: 230,
                unit: "beats/min",
                system: "http://unitsofmeasure.org",
                code: "beats/min"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/bc9569bc-e6e6-4f18-8b1a-2b6013a74df3",
        resource: {
          resourceType: "Observation",
          id: "bc9569bc-e6e6-4f18-8b1a-2b6013a74df3",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:35+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://ciel.org", code: "5087" },
              { system: "http://ampath.com/", code: "5087" },
              { system: "http://loinc.org", code: "8867-4" },
              { system: "http://snomed.info/sct", code: "78564009" },
              { system: "org.openmrs.module.mdrtb", code: "PULSE" },
              { system: "http://www.pih.org/", code: "5087" },
              {
                system: "http://openmrs.org",
                code: "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Pulse"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/1d2bdaf3-2a70-4035-844b-bbbb42cb666e"
          },
          effectiveDateTime: "2015-08-25T06:30:35+00:00",
          issued: "2015-08-25T06:30:35.000+00:00",
          valueQuantity: {
            value: 173,
            unit: "beats/min",
            system: "http://unitsofmeasure.org",
            code: "beats/min"
          },
          referenceRange: [
            {
              low: {
                value: 0,
                unit: "beats/min",
                system: "http://unitsofmeasure.org",
                code: "beats/min"
              },
              high: {
                value: 230,
                unit: "beats/min",
                system: "http://unitsofmeasure.org",
                code: "beats/min"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/b1c36f8e-9e2d-4684-843c-72b7cdffa790",
        resource: {
          resourceType: "Observation",
          id: "b1c36f8e-9e2d-4684-843c-72b7cdffa790",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:37+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://loinc.org", code: "8480-6" },
              { system: "http://ampath.com/", code: "5085" },
              { system: "http://ciel.org", code: "5085" },
              { system: "http://www.pih.org/", code: "5085" },
              { system: "http://snomed.info/sct", code: "271649006" },
              { system: "http://www.pih.org/country/malawi", code: "5085" },
              {
                system: "org.openmrs.module.mdrtb",
                code: "SYSTOLIC BLOOD PRESSURE"
              },
              {
                system: "http://openmrs.org",
                code: "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Systolic blood pressure"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/c8876e57-f788-47a1-b8fd-30dbbb497941"
          },
          effectiveDateTime: "2016-05-16T06:13:36+00:00",
          issued: "2016-05-16T06:13:36.000+00:00",
          valueQuantity: {
            value: 161,
            unit: "mmHg",
            system: "http://unitsofmeasure.org",
            code: "mmHg"
          },
          referenceRange: [
            {
              low: {
                value: 0,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mmHg"
              },
              high: {
                value: 250,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mmHg"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/e71a78b9-168c-44f8-bd75-8def540bd496",
        resource: {
          resourceType: "Observation",
          id: "e71a78b9-168c-44f8-bd75-8def540bd496",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:36+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://loinc.org", code: "8480-6" },
              { system: "http://ampath.com/", code: "5085" },
              { system: "http://ciel.org", code: "5085" },
              { system: "http://www.pih.org/", code: "5085" },
              { system: "http://snomed.info/sct", code: "271649006" },
              { system: "http://www.pih.org/country/malawi", code: "5085" },
              {
                system: "org.openmrs.module.mdrtb",
                code: "SYSTOLIC BLOOD PRESSURE"
              },
              {
                system: "http://openmrs.org",
                code: "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Systolic blood pressure"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/1d2bdaf3-2a70-4035-844b-bbbb42cb666e"
          },
          effectiveDateTime: "2015-08-25T06:30:35+00:00",
          issued: "2015-08-25T06:30:35.000+00:00",
          valueQuantity: {
            value: 156,
            unit: "mmHg",
            system: "http://unitsofmeasure.org",
            code: "mmHg"
          },
          referenceRange: [
            {
              low: {
                value: 0,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mmHg"
              },
              high: {
                value: 250,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mmHg"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/83699360-d195-4d22-a7f8-74c9f0716fd4",
        resource: {
          resourceType: "Observation",
          id: "83699360-d195-4d22-a7f8-74c9f0716fd4",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:37+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://loinc.org", code: "8310-5" },
              { system: "org.openmrs.module.mdrtb", code: "TEMPERATURE" },
              { system: "http://ciel.org", code: "5088" },
              { system: "http://snomed.info/snp", code: "386725007" },
              { system: "http://www.pih.org/", code: "5088" },
              { system: "http://ampath.com/", code: "5088" },
              {
                system: "http://openmrs.org",
                code: "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Temperature (C)"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/c8876e57-f788-47a1-b8fd-30dbbb497941"
          },
          effectiveDateTime: "2016-05-16T06:13:36+00:00",
          issued: "2016-05-16T06:13:36.000+00:00",
          valueQuantity: {
            value: 37,
            unit: "DEG C",
            system: "http://unitsofmeasure.org",
            code: "DEG C"
          },
          referenceRange: [
            {
              low: {
                value: 25,
                unit: "DEG C",
                system: "http://unitsofmeasure.org",
                code: "DEG C"
              },
              high: {
                value: 43,
                unit: "DEG C",
                system: "http://unitsofmeasure.org",
                code: "DEG C"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/d5db0d37-df12-4d4f-8576-66284497d34f",
        resource: {
          resourceType: "Observation",
          id: "d5db0d37-df12-4d4f-8576-66284497d34f",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:35+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://loinc.org", code: "8310-5" },
              { system: "org.openmrs.module.mdrtb", code: "TEMPERATURE" },
              { system: "http://ciel.org", code: "5088" },
              { system: "http://snomed.info/snp", code: "386725007" },
              { system: "http://www.pih.org/", code: "5088" },
              { system: "http://ampath.com/", code: "5088" },
              {
                system: "http://openmrs.org",
                code: "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Temperature (C)"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/1d2bdaf3-2a70-4035-844b-bbbb42cb666e"
          },
          effectiveDateTime: "2015-08-25T06:30:35+00:00",
          issued: "2015-08-25T06:30:35.000+00:00",
          valueQuantity: {
            value: 37,
            unit: "DEG C",
            system: "http://unitsofmeasure.org",
            code: "DEG C"
          },
          referenceRange: [
            {
              low: {
                value: 25,
                unit: "DEG C",
                system: "http://unitsofmeasure.org",
                code: "DEG C"
              },
              high: {
                value: 43,
                unit: "DEG C",
                system: "http://unitsofmeasure.org",
                code: "DEG C"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/bbee197c-6ac2-4790-a68f-6779847feb68",
        resource: {
          resourceType: "Observation",
          id: "bbee197c-6ac2-4790-a68f-6779847feb68",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:37+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://ciel.org", code: "5092" },
              {
                system: "https://www.e-imo.com/releases/problem-it",
                code: "3771"
              },
              { system: "http://snomed.info/sct", code: "431314004" },
              { system: "http://ampath.com/", code: "5092" },
              { system: "http://loinc.org", code: "2710-2" },
              {
                system: "https://www.e-imo.com/releases/problem-it",
                code: "26745610"
              },
              {
                system: "http://openmrs.org",
                code: "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Blood oxygen saturation"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/c8876e57-f788-47a1-b8fd-30dbbb497941"
          },
          effectiveDateTime: "2016-05-16T06:13:36+00:00",
          issued: "2016-05-16T06:13:36.000+00:00",
          valueQuantity: {
            value: 30,
            unit: "%",
            system: "http://unitsofmeasure.org",
            code: "%"
          },
          referenceRange: [
            {
              low: {
                value: 0,
                unit: "%",
                system: "http://unitsofmeasure.org",
                code: "%"
              },
              high: {
                value: 100,
                unit: "%",
                system: "http://unitsofmeasure.org",
                code: "%"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/f5d5bf54-55ba-409f-964a-c4c1c4ad7437",
        resource: {
          resourceType: "Observation",
          id: "f5d5bf54-55ba-409f-964a-c4c1c4ad7437",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:36+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://ciel.org", code: "5092" },
              {
                system: "https://www.e-imo.com/releases/problem-it",
                code: "3771"
              },
              { system: "http://snomed.info/sct", code: "431314004" },
              { system: "http://ampath.com/", code: "5092" },
              { system: "http://loinc.org", code: "2710-2" },
              {
                system: "https://www.e-imo.com/releases/problem-it",
                code: "26745610"
              },
              {
                system: "http://openmrs.org",
                code: "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Blood oxygen saturation"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/1d2bdaf3-2a70-4035-844b-bbbb42cb666e"
          },
          effectiveDateTime: "2015-08-25T06:30:35+00:00",
          issued: "2015-08-25T06:30:35.000+00:00",
          valueQuantity: {
            value: 41,
            unit: "%",
            system: "http://unitsofmeasure.org",
            code: "%"
          },
          referenceRange: [
            {
              low: {
                value: 0,
                unit: "%",
                system: "http://unitsofmeasure.org",
                code: "%"
              },
              high: {
                value: 100,
                unit: "%",
                system: "http://unitsofmeasure.org",
                code: "%"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/34c413ff-0cda-4594-b65c-d298a12ef6d4",
        resource: {
          resourceType: "Observation",
          id: "34c413ff-0cda-4594-b65c-d298a12ef6d4",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:37+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://www.pih.org/", code: "5086" },
              { system: "http://loinc.org", code: "35094-2" },
              { system: "http://loinc.org", code: "8462-4" },
              { system: "http://www.pih.org/country/malawi", code: "5086" },
              { system: "http://ciel.org", code: "5086" },
              { system: "http://snomed.info/sct", code: "271650006" },
              { system: "http://ampath.com/", code: "5086" },
              {
                system: "http://openmrs.org",
                code: "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Diastolic blood pressure"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/c8876e57-f788-47a1-b8fd-30dbbb497941"
          },
          effectiveDateTime: "2016-05-16T06:13:36+00:00",
          issued: "2016-05-16T06:13:36.000+00:00",
          valueQuantity: {
            value: 72,
            unit: "mmHg",
            system: "http://unitsofmeasure.org",
            code: "mmHg"
          },
          referenceRange: [
            {
              low: {
                value: 0,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mmHg"
              },
              high: {
                value: 150,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mmHg"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/bc37e12a-71f5-432e-8536-2fb6744471b3",
        resource: {
          resourceType: "Observation",
          id: "bc37e12a-71f5-432e-8536-2fb6744471b3",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:02:36+00:00"
            },
            {
              url:
                "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
              valueString: "daemon"
            },
            {
              url: "locationUuid",
              valueString: "58c57d25-8d39-41ab-8422-108a0c277d98"
            }
          ],
          status: "final",
          code: {
            coding: [
              { system: "http://www.pih.org/", code: "5086" },
              { system: "http://loinc.org", code: "35094-2" },
              { system: "http://loinc.org", code: "8462-4" },
              { system: "http://www.pih.org/country/malawi", code: "5086" },
              { system: "http://ciel.org", code: "5086" },
              { system: "http://snomed.info/sct", code: "271650006" },
              { system: "http://ampath.com/", code: "5086" },
              {
                system: "http://openmrs.org",
                code: "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Diastolic blood pressure"
              }
            ]
          },
          subject: {
            id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            reference: "Patient/90f7f0b4-06a8-4a97-9678-e7a977f4b518",
            identifier: { id: "90f7f0b4-06a8-4a97-9678-e7a977f4b518" },
            display: "John Taylor(Identifier:10010W)"
          },
          context: {
            reference: "Encounter/1d2bdaf3-2a70-4035-844b-bbbb42cb666e"
          },
          effectiveDateTime: "2015-08-25T06:30:35+00:00",
          issued: "2015-08-25T06:30:35.000+00:00",
          valueQuantity: {
            value: 64,
            unit: "mmHg",
            system: "http://unitsofmeasure.org",
            code: "mmHg"
          },
          referenceRange: [
            {
              low: {
                value: 0,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mmHg"
              },
              high: {
                value: 150,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mmHg"
              }
            }
          ]
        }
      }
    ]
  }
};

export const mockEmptyVitalsResponse = {
  headers: null,
  ok: true,
  redirected: true,
  status: 200,
  statusText: "ok",
  trailer: null,
  type: null,
  url: "",
  clone: null,
  body: null,
  bodyUsed: null,
  arrayBuffer: null,
  blob: null,
  formData: null,
  json: null,
  text: null,
  data: {
    resourceType: "Bundle",
    id: "63378630-e9a5-468b-baec-439d8ed55d09",
    meta: { lastUpdated: "2019-11-20T11:16:11.030+00:00" },
    type: "searchset",
    total: 10,
    link: [
      {
        relation: "self",
        url:
          "http://localhost:8080/openmrs/ws/fhir/Observation?code=5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&subject%3APatient=90f7f0b4-06a8-4a97-9678-e7a977f4b518"
      }
    ],
    entry: []
  }
};

export const mockVitalData = [
  {
    id: 1463379216000,
    date: "2016-05-16T06:13:36.000+00:00",
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenation: 30
  },
  {
    id: 1440484235000,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1440484235001,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1440484235002,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1463379216003,
    date: "2016-05-16T06:13:36.000+00:00",
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenation: 30
  },
  {
    id: 14404842350004,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 14404842350015,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 14404842350026,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 14633792160007,
    date: "2016-05-16T06:13:36.000+00:00",
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenation: 30
  },
  {
    id: 14404842350008,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 14404842350019,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 144048423500210,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 14633792160011,
    date: "2016-05-16T06:13:36.000+00:00",
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenation: 30
  },
  {
    id: 144048423500012,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1440484235001513,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1440484235002614,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 146337921600015,
    date: "2016-05-16T06:13:36.000+00:00",
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenation: 30
  },
  {
    id: 144048423500016,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 144048423500117,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 144048423500218,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 146337921600319,
    date: "2016-05-16T06:13:36.000+00:00",
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenation: 30
  },
  {
    id: 1440484235000420,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1440484235001521,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1440484235002622,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 146337921600023,
    date: "2016-05-16T06:13:36.000+00:00",
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenation: 30
  },
  {
    id: 144048423500024,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 144048423500125,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 144048423500226,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 146337921600327,
    date: "2016-05-16T06:13:36.000+00:00",
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenation: 30
  },
  {
    id: 1440484235000428,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1440484235001529,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  },
  {
    id: 1440484235002630,
    date: "2015-08-25T06:30:35.000+00:00",
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenation: 41
  }
];
