import dayjs from "dayjs";

const todaysDate = dayjs().format("YYYY-MM-DD");

export const mockDimensionResponse = {
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
    id: "f3714150-5ff8-4356-8dd5-0c5edc195d2a",
    meta: {
      lastUpdated: `${todaysDate}T09:32:14.334+00:00`
    },
    type: "searchset",
    total: 7,
    entry: [
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/8041ca42-b569-4b07-95d2-74c7e850c4d7",
        resource: {
          resourceType: "Observation",
          id: "8041ca42-b569-4b07-95d2-74c7e850c4d7",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: `${todaysDate}T06:49:00`
            },
            {
              url: "locationUuid",
              valueString: "b1a8b05e-3542-4037-bbd3-998ee9c40574"
            }
          ],
          status: "final",
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "8302-2"
              },
              {
                system: "http://snomed.info/sct",
                code: "50373000"
              },
              {
                system: "http://ampath.com/",
                code: "5090"
              },
              {
                system: "http://www.pih.org/country/malawi",
                code: "5090"
              },
              {
                system: "http://ciel.org",
                code: "5090"
              },
              {
                system: "http://www.pih.org/",
                code: "5090"
              },
              {
                system: "http://openmrs.org",
                code: "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Height (cm)"
              }
            ]
          },
          subject: {
            id: "6c201864-7ec0-4baa-a686-295c2c69ff41",
            reference: "Patient/6c201864-7ec0-4baa-a686-295c2c69ff41",
            identifier: {
              id: "6c201864-7ec0-4baa-a686-295c2c69ff41"
            },
            display: "John Green(Identifier:10040T)"
          },
          context: {
            reference: "Encounter/509992ff-6b9a-47b2-a946-b42791fdd98f"
          },
          effectiveDateTime: `${todaysDate}T06:49:00`,
          issued: `${todaysDate}T06:49:00`,
          performer: [
            {
              reference: "Practitioner/f4308d92-5043-4b49-af89-170953f4748a",
              display: "Super User(Identifier:UNKNOWN)"
            }
          ],
          valueQuantity: {
            value: null,
            unit: "cm",
            system: "http://unitsofmeasure.org",
            code: "cm"
          },
          referenceRange: [
            {
              low: {
                value: 10.0,
                unit: "cm",
                system: "http://unitsofmeasure.org",
                code: "cm"
              },
              high: {
                value: 272.0,
                unit: "cm",
                system: "http://unitsofmeasure.org",
                code: "cm"
              }
            }
          ]
        }
      },
      {
        fullUrl:
          "http://localhost:8080/openmrs/ws/fhir/Observation/7d300a63-b12b-4280-9788-928fc1d040ef",
        resource: {
          resourceType: "Observation",
          id: "7d300a63-b12b-4280-9788-928fc1d040ef",
          extension: [
            {
              url:
                "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
              valueDateTime: "2017-01-18T09:11:20+00:00"
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
              {
                system: "http://loinc.org",
                code: "8302-2"
              },
              {
                system: "http://snomed.info/sct",
                code: "50373000"
              },
              {
                system: "http://ampath.com/",
                code: "5090"
              },
              {
                system: "http://www.pih.org/country/malawi",
                code: "5090"
              },
              {
                system: "http://ciel.org",
                code: "5090"
              },
              {
                system: "http://www.pih.org/",
                code: "5090"
              },
              {
                system: "http://openmrs.org",
                code: "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                display: "Height (cm)"
              }
            ]
          },
          subject: {
            id: "6c201864-7ec0-4baa-a686-295c2c69ff41",
            reference: "Patient/6c201864-7ec0-4baa-a686-295c2c69ff41",
            identifier: {
              id: "6c201864-7ec0-4baa-a686-295c2c69ff41"
            },
            display: "John Green(Identifier:10040T)"
          },
          context: {
            reference: "Encounter/1a82fdc6-3d14-44c4-ab45-d65baa0062ae"
          },
          effectiveDateTime: "2016-12-18T06:48:20",
          issued: "2016-12-18T06:48:20.000",
          valueQuantity: {
            value: 173.0,
            unit: "cm",
            system: "http://unitsofmeasure.org",
            code: "cm"
          },
          referenceRange: [
            {
              low: {
                value: 10.0,
                unit: "cm",
                system: "http://unitsofmeasure.org",
                code: "cm"
              },
              high: {
                value: 272.0,
                unit: "cm",
                system: "http://unitsofmeasure.org",
                code: "cm"
              }
            }
          ]
        }
      }
    ]
  }
};
