export const mockBiometricsResponse = {
  resourceType: 'Bundle',
  id: '0b0f8529-3e6e-41d9-8007-0ef639fb893b',
  meta: {
    lastUpdated: '2021-07-21T09:48:21.941+00:00',
  },
  type: 'searchset',
  total: 49,
  link: [
    {
      relation: 'self',
      url: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation?_count=100&code=5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&subject%3APatient=8673ee4f-e2ab-4077-ba55-4980f408773e',
    },
  ],
  entry: [
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/9d0ce1b4-2957-4799-940f-dedd101d4264',
      resource: {
        resourceType: 'Observation',
        id: '9d0ce1b4-2957-4799-940f-dedd101d4264',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>9d0ce1b4-2957-4799-940f-dedd101d4264</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/86512be8-e535-456f-8076-3d43c0cc6206">Encounter/86512be8-e535-456f-8076-3d43c0cc6206</a></td></tr><tr><td>Effective:</td><td> 08 December 2020 05:31:59 </td></tr><tr><td>Issued:</td><td>08/12/2020 05:32:00 AM</td></tr><tr><td>Value:</td><td>75.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/86512be8-e535-456f-8076-3d43c0cc6206',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-08T05:31:59+00:00',
        issued: '2020-12-08T05:32:00.000+00:00',
        valueQuantity: {
          value: 75,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/cc341160-da75-4314-9e28-ae8a3f217fe0',
      resource: {
        resourceType: 'Observation',
        id: 'cc341160-da75-4314-9e28-ae8a3f217fe0',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>cc341160-da75-4314-9e28-ae8a3f217fe0</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/07a600da-cdf0-4665-ad07-08e083c9eaea">Encounter/07a600da-cdf0-4665-ad07-08e083c9eaea</a></td></tr><tr><td>Effective:</td><td> 08 December 2020 05:34:42 </td></tr><tr><td>Issued:</td><td>08/12/2020 05:34:43 AM</td></tr><tr><td>Value:</td><td>75.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/07a600da-cdf0-4665-ad07-08e083c9eaea',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-08T05:34:42+00:00',
        issued: '2020-12-08T05:34:43.000+00:00',
        valueQuantity: {
          value: 75,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/5c293034-2143-441c-890e-0826ea8ec282',
      resource: {
        resourceType: 'Observation',
        id: '5c293034-2143-441c-890e-0826ea8ec282',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>5c293034-2143-441c-890e-0826ea8ec282</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/0158ad38-d3f4-492a-9e46-1c1e6909c64f">Encounter/0158ad38-d3f4-492a-9e46-1c1e6909c64f</a></td></tr><tr><td>Effective:</td><td> 08 December 2020 11:46:43 </td></tr><tr><td>Issued:</td><td>08/12/2020 11:46:44 AM</td></tr><tr><td>Value:</td><td>73.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/0158ad38-d3f4-492a-9e46-1c1e6909c64f',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-08T11:46:43+00:00',
        issued: '2020-12-08T11:46:44.000+00:00',
        valueQuantity: {
          value: 73,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/90e35121-00bf-4983-a970-81d342529508',
      resource: {
        resourceType: 'Observation',
        id: '90e35121-00bf-4983-a970-81d342529508',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>90e35121-00bf-4983-a970-81d342529508</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/3ccfbb0d-f1de-4000-b6cc-d819fdca8c95">Encounter/3ccfbb0d-f1de-4000-b6cc-d819fdca8c95</a></td></tr><tr><td>Effective:</td><td> 08 December 2020 16:57:32 </td></tr><tr><td>Issued:</td><td>08/12/2020 04:57:33 PM</td></tr><tr><td>Value:</td><td>65.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/3ccfbb0d-f1de-4000-b6cc-d819fdca8c95',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-08T16:57:32+00:00',
        issued: '2020-12-08T16:57:33.000+00:00',
        valueQuantity: {
          value: 65,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/bb7812d2-31d2-41a0-a50b-53c13aeb5c16',
      resource: {
        resourceType: 'Observation',
        id: 'bb7812d2-31d2-41a0-a50b-53c13aeb5c16',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>bb7812d2-31d2-41a0-a50b-53c13aeb5c16</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/6f25a7db-63b0-46bc-9b97-0fd1b6204a06">Encounter/6f25a7db-63b0-46bc-9b97-0fd1b6204a06</a></td></tr><tr><td>Effective:</td><td> 09 December 2020 13:25:28 </td></tr><tr><td>Issued:</td><td>09/12/2020 01:25:29 PM</td></tr><tr><td>Value:</td><td>90.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/6f25a7db-63b0-46bc-9b97-0fd1b6204a06',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-09T13:25:28+00:00',
        issued: '2020-12-09T13:25:29.000+00:00',
        valueQuantity: {
          value: 90,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/8030d1a6-a3de-4658-9ed5-7777549fffab',
      resource: {
        resourceType: 'Observation',
        id: '8030d1a6-a3de-4658-9ed5-7777549fffab',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>8030d1a6-a3de-4658-9ed5-7777549fffab</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/aa1278bc-454f-43c9-8ca9-28b971066086">Encounter/aa1278bc-454f-43c9-8ca9-28b971066086</a></td></tr><tr><td>Effective:</td><td> 10 December 2020 10:07:23 </td></tr><tr><td>Issued:</td><td>10/12/2020 10:07:23 AM</td></tr><tr><td>Value:</td><td>75.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/aa1278bc-454f-43c9-8ca9-28b971066086',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-10T10:07:23+00:00',
        issued: '2020-12-10T10:07:23.000+00:00',
        valueQuantity: {
          value: 75,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/68d94b1b-7f08-487a-ab02-4b1d25769ff9',
      resource: {
        resourceType: 'Observation',
        id: '68d94b1b-7f08-487a-ab02-4b1d25769ff9',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>68d94b1b-7f08-487a-ab02-4b1d25769ff9</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c80bb915-321f-4d02-a3e2-eb113b4a0bbb">Encounter/c80bb915-321f-4d02-a3e2-eb113b4a0bbb</a></td></tr><tr><td>Effective:</td><td> 04 January 2021 12:36:38 </td></tr><tr><td>Issued:</td><td>04/01/2021 12:36:38 PM</td></tr><tr><td>Value:</td><td>75.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/c80bb915-321f-4d02-a3e2-eb113b4a0bbb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-01-04T12:36:38+00:00',
        issued: '2021-01-04T12:36:38.000+00:00',
        valueQuantity: {
          value: 75,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/6c3f0507-f8c6-4fe5-be45-75004c397377',
      resource: {
        resourceType: 'Observation',
        id: '6c3f0507-f8c6-4fe5-be45-75004c397377',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>6c3f0507-f8c6-4fe5-be45-75004c397377</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/644ddcd1-df72-4ed9-b2a0-10d519b9fad3">Encounter/644ddcd1-df72-4ed9-b2a0-10d519b9fad3</a></td></tr><tr><td>Effective:</td><td> 14 November 2019 07:37:31 </td></tr><tr><td>Issued:</td><td>18/01/2021 11:21:07 PM</td></tr><tr><td>Value:</td><td>70.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/644ddcd1-df72-4ed9-b2a0-10d519b9fad3',
          type: 'Encounter',
        },
        effectiveDateTime: '2019-11-14T07:37:31+00:00',
        issued: '2021-01-18T23:21:07.000+00:00',
        valueQuantity: {
          value: 70,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/c4719c46-3afd-4b92-8f34-5b48b99876e1',
      resource: {
        resourceType: 'Observation',
        id: 'c4719c46-3afd-4b92-8f34-5b48b99876e1',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>c4719c46-3afd-4b92-8f34-5b48b99876e1</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/e348efc6-14eb-4b06-a95b-c99ba664f464">Encounter/e348efc6-14eb-4b06-a95b-c99ba664f464</a></td></tr><tr><td>Effective:</td><td> 20 January 2021 09:58:00 </td></tr><tr><td>Issued:</td><td>20/01/2021 09:58:00 AM</td></tr><tr><td>Value:</td><td>104.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/e348efc6-14eb-4b06-a95b-c99ba664f464',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-01-20T09:58:00+00:00',
        issued: '2021-01-20T09:58:00.000+00:00',
        valueQuantity: {
          value: 104,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/6448739f-59dd-4af8-94d4-d524a99f1297',
      resource: {
        resourceType: 'Observation',
        id: '6448739f-59dd-4af8-94d4-d524a99f1297',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>6448739f-59dd-4af8-94d4-d524a99f1297</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/db1c2b8b-de5a-44fb-987b-68e5ba9bf8dd">Encounter/db1c2b8b-de5a-44fb-987b-68e5ba9bf8dd</a></td></tr><tr><td>Effective:</td><td> 11 February 2021 07:10:15 </td></tr><tr><td>Issued:</td><td>11/02/2021 06:41:16 PM</td></tr><tr><td>Value:</td><td>75.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/db1c2b8b-de5a-44fb-987b-68e5ba9bf8dd',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-02-11T07:10:15+00:00',
        issued: '2021-02-11T18:41:16.000+00:00',
        valueQuantity: {
          value: 75,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/c71ad411-9c41-40fc-a4dc-ecbee9200a72',
      resource: {
        resourceType: 'Observation',
        id: 'c71ad411-9c41-40fc-a4dc-ecbee9200a72',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>c71ad411-9c41-40fc-a4dc-ecbee9200a72</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/b4399c30-73c1-48a6-abed-520912ffbd96">Encounter/b4399c30-73c1-48a6-abed-520912ffbd96</a></td></tr><tr><td>Effective:</td><td> 17 February 2021 21:10:04 </td></tr><tr><td>Issued:</td><td>17/02/2021 09:10:04 PM</td></tr><tr><td>Value:</td><td>10.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b4399c30-73c1-48a6-abed-520912ffbd96',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-02-17T21:10:04+00:00',
        issued: '2021-02-17T21:10:04.000+00:00',
        valueQuantity: {
          value: 10,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/6fafa681-632c-4151-8f0f-0abc59a75afa',
      resource: {
        resourceType: 'Observation',
        id: '6fafa681-632c-4151-8f0f-0abc59a75afa',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>6fafa681-632c-4151-8f0f-0abc59a75afa</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c87eeb19-f23d-41a0-b7ac-71ef8550f923">Encounter/c87eeb19-f23d-41a0-b7ac-71ef8550f923</a></td></tr><tr><td>Effective:</td><td> 19 February 2021 12:37:08 </td></tr><tr><td>Issued:</td><td>19/02/2021 12:37:08 PM</td></tr><tr><td>Value:</td><td>65.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/c87eeb19-f23d-41a0-b7ac-71ef8550f923',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-02-19T12:37:08+00:00',
        issued: '2021-02-19T12:37:08.000+00:00',
        valueQuantity: {
          value: 65,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/85130896-f978-4044-8b2d-b52f27f0eede',
      resource: {
        resourceType: 'Observation',
        id: '85130896-f978-4044-8b2d-b52f27f0eede',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>85130896-f978-4044-8b2d-b52f27f0eede</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/000df441-1367-4e3d-ae67-b0c852cc2654">Encounter/000df441-1367-4e3d-ae67-b0c852cc2654</a></td></tr><tr><td>Effective:</td><td> 21 February 2021 11:00:44 </td></tr><tr><td>Issued:</td><td>21/02/2021 11:00:44 AM</td></tr><tr><td>Value:</td><td>75.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/000df441-1367-4e3d-ae67-b0c852cc2654',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-02-21T11:00:44+00:00',
        issued: '2021-02-21T11:00:44.000+00:00',
        valueQuantity: {
          value: 75,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/3db436d9-8138-4b04-b8d2-35c898bd820a',
      resource: {
        resourceType: 'Observation',
        id: '3db436d9-8138-4b04-b8d2-35c898bd820a',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>3db436d9-8138-4b04-b8d2-35c898bd820a</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/72f6a2f9-1816-475f-bc95-346963baf7e0">Encounter/72f6a2f9-1816-475f-bc95-346963baf7e0</a></td></tr><tr><td>Effective:</td><td> 08 March 2021 13:40:04 </td></tr><tr><td>Issued:</td><td>08/03/2021 01:40:04 PM</td></tr><tr><td>Value:</td><td>110.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/72f6a2f9-1816-475f-bc95-346963baf7e0',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-08T13:40:04+00:00',
        issued: '2021-03-08T13:40:04.000+00:00',
        valueQuantity: {
          value: 110,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/a42ccb65-33e5-43b1-8d4e-4ee23fe9a2c4',
      resource: {
        resourceType: 'Observation',
        id: 'a42ccb65-33e5-43b1-8d4e-4ee23fe9a2c4',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>a42ccb65-33e5-43b1-8d4e-4ee23fe9a2c4</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/e00cbc9f-9bc8-4710-b824-b10f030bc344">Encounter/e00cbc9f-9bc8-4710-b824-b10f030bc344</a></td></tr><tr><td>Effective:</td><td> 13 March 2021 21:37:54 </td></tr><tr><td>Issued:</td><td>13/03/2021 09:37:54 PM</td></tr><tr><td>Value:</td><td>88.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/e00cbc9f-9bc8-4710-b824-b10f030bc344',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-13T21:37:54+00:00',
        issued: '2021-03-13T21:37:54.000+00:00',
        valueQuantity: {
          value: 88,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/d88d045b-735f-416e-9bbe-738daa9e588d',
      resource: {
        resourceType: 'Observation',
        id: 'd88d045b-735f-416e-9bbe-738daa9e588d',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>d88d045b-735f-416e-9bbe-738daa9e588d</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/5859f098-45d6-4c4e-9447-53dd4032d7d7">Encounter/5859f098-45d6-4c4e-9447-53dd4032d7d7</a></td></tr><tr><td>Effective:</td><td> 16 March 2021 08:17:34 </td></tr><tr><td>Issued:</td><td>16/03/2021 08:17:34 AM</td></tr><tr><td>Value:</td><td>198.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/5859f098-45d6-4c4e-9447-53dd4032d7d7',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-16T08:17:34+00:00',
        issued: '2021-03-16T08:17:34.000+00:00',
        valueQuantity: {
          value: 198,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/b427aea2-e048-4649-8b1e-ab934995e3d4',
      resource: {
        resourceType: 'Observation',
        id: 'b427aea2-e048-4649-8b1e-ab934995e3d4',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>b427aea2-e048-4649-8b1e-ab934995e3d4</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/e1215283-735e-4fd5-acb7-3230d9e81785">Encounter/e1215283-735e-4fd5-acb7-3230d9e81785</a></td></tr><tr><td>Effective:</td><td> 17 March 2021 06:34:10 </td></tr><tr><td>Issued:</td><td>17/03/2021 06:34:10 AM</td></tr><tr><td>Value:</td><td>77.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/e1215283-735e-4fd5-acb7-3230d9e81785',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-17T06:34:10+00:00',
        issued: '2021-03-17T06:34:10.000+00:00',
        valueQuantity: {
          value: 77,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/5d2f6420-810b-460d-aea3-9e13d7550d18',
      resource: {
        resourceType: 'Observation',
        id: '5d2f6420-810b-460d-aea3-9e13d7550d18',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>5d2f6420-810b-460d-aea3-9e13d7550d18</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/7c7b9d1b-f177-4d27-bdf0-084e4f712b89">Encounter/7c7b9d1b-f177-4d27-bdf0-084e4f712b89</a></td></tr><tr><td>Effective:</td><td> 18 March 2021 10:42:41 </td></tr><tr><td>Issued:</td><td>18/03/2021 10:42:41 AM</td></tr><tr><td>Value:</td><td>90.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/7c7b9d1b-f177-4d27-bdf0-084e4f712b89',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-18T10:42:41+00:00',
        issued: '2021-03-18T10:42:41.000+00:00',
        valueQuantity: {
          value: 90,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/e55de98d-b689-4e44-86bb-6f5e1e53476e',
      resource: {
        resourceType: 'Observation',
        id: 'e55de98d-b689-4e44-86bb-6f5e1e53476e',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>e55de98d-b689-4e44-86bb-6f5e1e53476e</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/838c9b30-9671-4af9-bf3e-b3a6ed6ab5ef">Encounter/838c9b30-9671-4af9-bf3e-b3a6ed6ab5ef</a></td></tr><tr><td>Effective:</td><td> 23 March 2021 06:39:19 </td></tr><tr><td>Issued:</td><td>23/03/2021 06:39:19 AM</td></tr><tr><td>Value:</td><td>99.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/838c9b30-9671-4af9-bf3e-b3a6ed6ab5ef',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-23T06:39:19+00:00',
        issued: '2021-03-23T06:39:19.000+00:00',
        valueQuantity: {
          value: 99,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/5a3c78a7-6e20-429c-8621-59fe20884004',
      resource: {
        resourceType: 'Observation',
        id: '5a3c78a7-6e20-429c-8621-59fe20884004',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>5a3c78a7-6e20-429c-8621-59fe20884004</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/e1cc5f30-3a60-4232-be44-371dc747bc95">Encounter/e1cc5f30-3a60-4232-be44-371dc747bc95</a></td></tr><tr><td>Effective:</td><td> 30 March 2021 10:49:59 </td></tr><tr><td>Issued:</td><td>30/03/2021 10:49:59 AM</td></tr><tr><td>Value:</td><td>87.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/e1cc5f30-3a60-4232-be44-371dc747bc95',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-30T10:49:59+00:00',
        issued: '2021-03-30T10:49:59.000+00:00',
        valueQuantity: {
          value: 87,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/46f73822-f7a7-4bea-9241-5354598128e2',
      resource: {
        resourceType: 'Observation',
        id: '46f73822-f7a7-4bea-9241-5354598128e2',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>46f73822-f7a7-4bea-9241-5354598128e2</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20">Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20</a></td></tr><tr><td>Effective:</td><td> 08 April 2021 14:44:24 </td></tr><tr><td>Issued:</td><td>08/04/2021 02:44:24 PM</td></tr><tr><td>Value:</td><td>67.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-04-08T14:44:24+00:00',
        issued: '2021-04-08T14:44:24.000+00:00',
        valueQuantity: {
          value: 67,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/e5f5fd79-1545-4808-9ac0-a6dd38c258fb',
      resource: {
        resourceType: 'Observation',
        id: 'e5f5fd79-1545-4808-9ac0-a6dd38c258fb',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>e5f5fd79-1545-4808-9ac0-a6dd38c258fb</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb">Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb</a></td></tr><tr><td>Effective:</td><td> 10 May 2021 06:41:46 </td></tr><tr><td>Issued:</td><td>10/05/2021 06:41:46 AM</td></tr><tr><td>Value:</td><td>90.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 90,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/f2b22cff-350d-4dcd-b216-d7b670dd7468',
      resource: {
        resourceType: 'Observation',
        id: 'f2b22cff-350d-4dcd-b216-d7b670dd7468',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>f2b22cff-350d-4dcd-b216-d7b670dd7468</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/be82d122-367a-4121-9413-b967dc90fc71">Encounter/be82d122-367a-4121-9413-b967dc90fc71</a></td></tr><tr><td>Effective:</td><td> 26 May 2021 15:21:43 </td></tr><tr><td>Issued:</td><td>26/05/2021 03:21:43 PM</td></tr><tr><td>Value:</td><td>61.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/be82d122-367a-4121-9413-b967dc90fc71',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-26T15:21:43+00:00',
        issued: '2021-05-26T15:21:43.000+00:00',
        valueQuantity: {
          value: 61,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/b803269e-971c-4ebc-ac35-0b31409574b1',
      resource: {
        resourceType: 'Observation',
        id: 'b803269e-971c-4ebc-ac35-0b31409574b1',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>b803269e-971c-4ebc-ac35-0b31409574b1</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/bfb11318-4735-4f19-a951-dd10e40c906d">Encounter/bfb11318-4735-4f19-a951-dd10e40c906d</a></td></tr><tr><td>Effective:</td><td> 10 June 2021 13:40:06 </td></tr><tr><td>Issued:</td><td>10/06/2021 01:40:07 PM</td></tr><tr><td>Value:</td><td>50.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/bfb11318-4735-4f19-a951-dd10e40c906d',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-06-10T13:40:06+00:00',
        issued: '2021-06-10T13:40:07.000+00:00',
        valueQuantity: {
          value: 50,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/be9c1e04-207e-43ca-b36e-b09c41c56f5a',
      resource: {
        resourceType: 'Observation',
        id: 'be9c1e04-207e-43ca-b36e-b09c41c56f5a',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>be9c1e04-207e-43ca-b36e-b09c41c56f5a</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Weight (kg) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/da76b284-df1f-4b18-9236-fb44e3d96823">Encounter/da76b284-df1f-4b18-9236-fb44e3d96823</a></td></tr><tr><td>Effective:</td><td> 18 June 2021 09:02:03 </td></tr><tr><td>Issued:</td><td>18/06/2021 09:02:04 AM</td></tr><tr><td>Value:</td><td>80.0 kg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>250.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/da76b284-df1f-4b18-9236-fb44e3d96823',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-06-18T09:02:03+00:00',
        issued: '2021-06-18T09:02:04.000+00:00',
        valueQuantity: {
          value: 80,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/ec63aa6d-d9e9-44d2-bedb-2bfaebf3752a',
      resource: {
        resourceType: 'Observation',
        id: 'ec63aa6d-d9e9-44d2-bedb-2bfaebf3752a',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>ec63aa6d-d9e9-44d2-bedb-2bfaebf3752a</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/86512be8-e535-456f-8076-3d43c0cc6206">Encounter/86512be8-e535-456f-8076-3d43c0cc6206</a></td></tr><tr><td>Effective:</td><td> 08 December 2020 05:31:59 </td></tr><tr><td>Issued:</td><td>08/12/2020 05:32:00 AM</td></tr><tr><td>Value:</td><td>165.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/86512be8-e535-456f-8076-3d43c0cc6206',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-08T05:31:59+00:00',
        issued: '2020-12-08T05:32:00.000+00:00',
        valueQuantity: {
          value: 165,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/b545135f-6d8e-4530-af74-21bd14d6fe24',
      resource: {
        resourceType: 'Observation',
        id: 'b545135f-6d8e-4530-af74-21bd14d6fe24',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>b545135f-6d8e-4530-af74-21bd14d6fe24</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/07a600da-cdf0-4665-ad07-08e083c9eaea">Encounter/07a600da-cdf0-4665-ad07-08e083c9eaea</a></td></tr><tr><td>Effective:</td><td> 08 December 2020 05:34:42 </td></tr><tr><td>Issued:</td><td>08/12/2020 05:34:43 AM</td></tr><tr><td>Value:</td><td>165.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/07a600da-cdf0-4665-ad07-08e083c9eaea',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-08T05:34:42+00:00',
        issued: '2020-12-08T05:34:43.000+00:00',
        valueQuantity: {
          value: 165,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/005f1819-9edf-46d7-bcb0-88884a8d176c',
      resource: {
        resourceType: 'Observation',
        id: '005f1819-9edf-46d7-bcb0-88884a8d176c',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>005f1819-9edf-46d7-bcb0-88884a8d176c</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/0158ad38-d3f4-492a-9e46-1c1e6909c64f">Encounter/0158ad38-d3f4-492a-9e46-1c1e6909c64f</a></td></tr><tr><td>Effective:</td><td> 08 December 2020 11:46:43 </td></tr><tr><td>Issued:</td><td>08/12/2020 11:46:44 AM</td></tr><tr><td>Value:</td><td>185.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/0158ad38-d3f4-492a-9e46-1c1e6909c64f',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-08T11:46:43+00:00',
        issued: '2020-12-08T11:46:44.000+00:00',
        valueQuantity: {
          value: 185,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/d0da6bd7-c239-4280-9a3f-ed2bfd68985d',
      resource: {
        resourceType: 'Observation',
        id: 'd0da6bd7-c239-4280-9a3f-ed2bfd68985d',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>d0da6bd7-c239-4280-9a3f-ed2bfd68985d</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/3ccfbb0d-f1de-4000-b6cc-d819fdca8c95">Encounter/3ccfbb0d-f1de-4000-b6cc-d819fdca8c95</a></td></tr><tr><td>Effective:</td><td> 08 December 2020 16:57:32 </td></tr><tr><td>Issued:</td><td>08/12/2020 04:57:33 PM</td></tr><tr><td>Value:</td><td>175.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/3ccfbb0d-f1de-4000-b6cc-d819fdca8c95',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-08T16:57:32+00:00',
        issued: '2020-12-08T16:57:33.000+00:00',
        valueQuantity: {
          value: 175,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/fd9448a7-9c6c-486c-80db-be2cfc9a75bc',
      resource: {
        resourceType: 'Observation',
        id: 'fd9448a7-9c6c-486c-80db-be2cfc9a75bc',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>fd9448a7-9c6c-486c-80db-be2cfc9a75bc</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/6f25a7db-63b0-46bc-9b97-0fd1b6204a06">Encounter/6f25a7db-63b0-46bc-9b97-0fd1b6204a06</a></td></tr><tr><td>Effective:</td><td> 09 December 2020 13:25:28 </td></tr><tr><td>Issued:</td><td>09/12/2020 01:25:29 PM</td></tr><tr><td>Value:</td><td>199.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/6f25a7db-63b0-46bc-9b97-0fd1b6204a06',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-09T13:25:28+00:00',
        issued: '2020-12-09T13:25:29.000+00:00',
        valueQuantity: {
          value: 199,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/6480ade6-ea10-4e57-af15-113a40cf7df7',
      resource: {
        resourceType: 'Observation',
        id: '6480ade6-ea10-4e57-af15-113a40cf7df7',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>6480ade6-ea10-4e57-af15-113a40cf7df7</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/aa1278bc-454f-43c9-8ca9-28b971066086">Encounter/aa1278bc-454f-43c9-8ca9-28b971066086</a></td></tr><tr><td>Effective:</td><td> 10 December 2020 10:07:23 </td></tr><tr><td>Issued:</td><td>10/12/2020 10:07:23 AM</td></tr><tr><td>Value:</td><td>165.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/aa1278bc-454f-43c9-8ca9-28b971066086',
          type: 'Encounter',
        },
        effectiveDateTime: '2020-12-10T10:07:23+00:00',
        issued: '2020-12-10T10:07:23.000+00:00',
        valueQuantity: {
          value: 165,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/1c476aa1-583c-4e85-8b76-7dba0fe36375',
      resource: {
        resourceType: 'Observation',
        id: '1c476aa1-583c-4e85-8b76-7dba0fe36375',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>1c476aa1-583c-4e85-8b76-7dba0fe36375</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c80bb915-321f-4d02-a3e2-eb113b4a0bbb">Encounter/c80bb915-321f-4d02-a3e2-eb113b4a0bbb</a></td></tr><tr><td>Effective:</td><td> 04 January 2021 12:36:38 </td></tr><tr><td>Issued:</td><td>04/01/2021 12:36:38 PM</td></tr><tr><td>Value:</td><td>165.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/c80bb915-321f-4d02-a3e2-eb113b4a0bbb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-01-04T12:36:38+00:00',
        issued: '2021-01-04T12:36:38.000+00:00',
        valueQuantity: {
          value: 165,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/129e6056-0a46-4a90-bc78-e16208889d93',
      resource: {
        resourceType: 'Observation',
        id: '129e6056-0a46-4a90-bc78-e16208889d93',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>129e6056-0a46-4a90-bc78-e16208889d93</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/e348efc6-14eb-4b06-a95b-c99ba664f464">Encounter/e348efc6-14eb-4b06-a95b-c99ba664f464</a></td></tr><tr><td>Effective:</td><td> 20 January 2021 09:58:00 </td></tr><tr><td>Issued:</td><td>20/01/2021 09:58:00 AM</td></tr><tr><td>Value:</td><td>198.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/e348efc6-14eb-4b06-a95b-c99ba664f464',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-01-20T09:58:00+00:00',
        issued: '2021-01-20T09:58:00.000+00:00',
        valueQuantity: {
          value: 198,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/4fc69280-c90a-42b8-b2e8-834a0d1a9a52',
      resource: {
        resourceType: 'Observation',
        id: '4fc69280-c90a-42b8-b2e8-834a0d1a9a52',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>4fc69280-c90a-42b8-b2e8-834a0d1a9a52</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/db1c2b8b-de5a-44fb-987b-68e5ba9bf8dd">Encounter/db1c2b8b-de5a-44fb-987b-68e5ba9bf8dd</a></td></tr><tr><td>Effective:</td><td> 11 February 2021 07:10:15 </td></tr><tr><td>Issued:</td><td>11/02/2021 06:41:16 PM</td></tr><tr><td>Value:</td><td>175.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/db1c2b8b-de5a-44fb-987b-68e5ba9bf8dd',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-02-11T07:10:15+00:00',
        issued: '2021-02-11T18:41:16.000+00:00',
        valueQuantity: {
          value: 175,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/b0f75c46-9e29-48f5-93aa-0923a3d546b6',
      resource: {
        resourceType: 'Observation',
        id: 'b0f75c46-9e29-48f5-93aa-0923a3d546b6',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>b0f75c46-9e29-48f5-93aa-0923a3d546b6</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/b4399c30-73c1-48a6-abed-520912ffbd96">Encounter/b4399c30-73c1-48a6-abed-520912ffbd96</a></td></tr><tr><td>Effective:</td><td> 17 February 2021 21:10:04 </td></tr><tr><td>Issued:</td><td>17/02/2021 09:10:04 PM</td></tr><tr><td>Value:</td><td>10.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b4399c30-73c1-48a6-abed-520912ffbd96',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-02-17T21:10:04+00:00',
        issued: '2021-02-17T21:10:04.000+00:00',
        valueQuantity: {
          value: 10,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/a83a39d5-6017-4d18-9999-cd51364766e0',
      resource: {
        resourceType: 'Observation',
        id: 'a83a39d5-6017-4d18-9999-cd51364766e0',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>a83a39d5-6017-4d18-9999-cd51364766e0</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/c87eeb19-f23d-41a0-b7ac-71ef8550f923">Encounter/c87eeb19-f23d-41a0-b7ac-71ef8550f923</a></td></tr><tr><td>Effective:</td><td> 19 February 2021 12:37:08 </td></tr><tr><td>Issued:</td><td>19/02/2021 12:37:08 PM</td></tr><tr><td>Value:</td><td>189.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/c87eeb19-f23d-41a0-b7ac-71ef8550f923',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-02-19T12:37:08+00:00',
        issued: '2021-02-19T12:37:08.000+00:00',
        valueQuantity: {
          value: 189,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/655e71e0-f569-4157-95e8-961017eed1f6',
      resource: {
        resourceType: 'Observation',
        id: '655e71e0-f569-4157-95e8-961017eed1f6',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>655e71e0-f569-4157-95e8-961017eed1f6</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/000df441-1367-4e3d-ae67-b0c852cc2654">Encounter/000df441-1367-4e3d-ae67-b0c852cc2654</a></td></tr><tr><td>Effective:</td><td> 21 February 2021 11:00:44 </td></tr><tr><td>Issued:</td><td>21/02/2021 11:00:44 AM</td></tr><tr><td>Value:</td><td>185.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/000df441-1367-4e3d-ae67-b0c852cc2654',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-02-21T11:00:44+00:00',
        issued: '2021-02-21T11:00:44.000+00:00',
        valueQuantity: {
          value: 185,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/d732275c-876a-4750-b525-b1521735971c',
      resource: {
        resourceType: 'Observation',
        id: 'd732275c-876a-4750-b525-b1521735971c',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>d732275c-876a-4750-b525-b1521735971c</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/72f6a2f9-1816-475f-bc95-346963baf7e0">Encounter/72f6a2f9-1816-475f-bc95-346963baf7e0</a></td></tr><tr><td>Effective:</td><td> 08 March 2021 13:40:04 </td></tr><tr><td>Issued:</td><td>08/03/2021 01:40:04 PM</td></tr><tr><td>Value:</td><td>198.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/72f6a2f9-1816-475f-bc95-346963baf7e0',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-08T13:40:04+00:00',
        issued: '2021-03-08T13:40:04.000+00:00',
        valueQuantity: {
          value: 198,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/0899ef34-eb20-4172-891b-cad336d39780',
      resource: {
        resourceType: 'Observation',
        id: '0899ef34-eb20-4172-891b-cad336d39780',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>0899ef34-eb20-4172-891b-cad336d39780</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/5653f22c-891f-458d-983b-7cf1f3aa3322">Encounter/5653f22c-891f-458d-983b-7cf1f3aa3322</a></td></tr><tr><td>Effective:</td><td> 10 March 2021 13:44:04 </td></tr><tr><td>Issued:</td><td>10/03/2021 01:44:04 PM</td></tr><tr><td>Value:</td><td>10.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/5653f22c-891f-458d-983b-7cf1f3aa3322',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-10T13:44:04+00:00',
        issued: '2021-03-10T13:44:04.000+00:00',
        valueQuantity: {
          value: 10,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/f8556923-f044-44a5-bb66-b20b7dff824e',
      resource: {
        resourceType: 'Observation',
        id: 'f8556923-f044-44a5-bb66-b20b7dff824e',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>f8556923-f044-44a5-bb66-b20b7dff824e</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/e00cbc9f-9bc8-4710-b824-b10f030bc344">Encounter/e00cbc9f-9bc8-4710-b824-b10f030bc344</a></td></tr><tr><td>Effective:</td><td> 13 March 2021 21:37:54 </td></tr><tr><td>Issued:</td><td>13/03/2021 09:37:54 PM</td></tr><tr><td>Value:</td><td>88.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/e00cbc9f-9bc8-4710-b824-b10f030bc344',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-13T21:37:54+00:00',
        issued: '2021-03-13T21:37:54.000+00:00',
        valueQuantity: {
          value: 88,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/219ed4d5-fc89-4765-91be-b848173c96ad',
      resource: {
        resourceType: 'Observation',
        id: '219ed4d5-fc89-4765-91be-b848173c96ad',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>219ed4d5-fc89-4765-91be-b848173c96ad</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/5859f098-45d6-4c4e-9447-53dd4032d7d7">Encounter/5859f098-45d6-4c4e-9447-53dd4032d7d7</a></td></tr><tr><td>Effective:</td><td> 16 March 2021 08:17:34 </td></tr><tr><td>Issued:</td><td>16/03/2021 08:17:34 AM</td></tr><tr><td>Value:</td><td>180.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/5859f098-45d6-4c4e-9447-53dd4032d7d7',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-16T08:17:34+00:00',
        issued: '2021-03-16T08:17:34.000+00:00',
        valueQuantity: {
          value: 180,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/19e7218b-c6e0-4327-a398-fcd5314d8a6b',
      resource: {
        resourceType: 'Observation',
        id: '19e7218b-c6e0-4327-a398-fcd5314d8a6b',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>19e7218b-c6e0-4327-a398-fcd5314d8a6b</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/e1215283-735e-4fd5-acb7-3230d9e81785">Encounter/e1215283-735e-4fd5-acb7-3230d9e81785</a></td></tr><tr><td>Effective:</td><td> 17 March 2021 06:34:10 </td></tr><tr><td>Issued:</td><td>17/03/2021 06:34:10 AM</td></tr><tr><td>Value:</td><td>176.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/e1215283-735e-4fd5-acb7-3230d9e81785',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-17T06:34:10+00:00',
        issued: '2021-03-17T06:34:10.000+00:00',
        valueQuantity: {
          value: 176,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/13224b34-0bf9-4daa-b84b-80b6b0c24721',
      resource: {
        resourceType: 'Observation',
        id: '13224b34-0bf9-4daa-b84b-80b6b0c24721',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>13224b34-0bf9-4daa-b84b-80b6b0c24721</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/7c7b9d1b-f177-4d27-bdf0-084e4f712b89">Encounter/7c7b9d1b-f177-4d27-bdf0-084e4f712b89</a></td></tr><tr><td>Effective:</td><td> 18 March 2021 10:42:41 </td></tr><tr><td>Issued:</td><td>18/03/2021 10:42:41 AM</td></tr><tr><td>Value:</td><td>180.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/7c7b9d1b-f177-4d27-bdf0-084e4f712b89',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-18T10:42:41+00:00',
        issued: '2021-03-18T10:42:41.000+00:00',
        valueQuantity: {
          value: 180,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/caa606f7-2c65-415d-b4fc-e0b04eb13255',
      resource: {
        resourceType: 'Observation',
        id: 'caa606f7-2c65-415d-b4fc-e0b04eb13255',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>caa606f7-2c65-415d-b4fc-e0b04eb13255</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/838c9b30-9671-4af9-bf3e-b3a6ed6ab5ef">Encounter/838c9b30-9671-4af9-bf3e-b3a6ed6ab5ef</a></td></tr><tr><td>Effective:</td><td> 23 March 2021 06:39:19 </td></tr><tr><td>Issued:</td><td>23/03/2021 06:39:19 AM</td></tr><tr><td>Value:</td><td>198.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/838c9b30-9671-4af9-bf3e-b3a6ed6ab5ef',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-23T06:39:19+00:00',
        issued: '2021-03-23T06:39:19.000+00:00',
        valueQuantity: {
          value: 198,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/9928d03d-d2f2-448b-87f0-d7121daeacf2',
      resource: {
        resourceType: 'Observation',
        id: '9928d03d-d2f2-448b-87f0-d7121daeacf2',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>9928d03d-d2f2-448b-87f0-d7121daeacf2</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/e1cc5f30-3a60-4232-be44-371dc747bc95">Encounter/e1cc5f30-3a60-4232-be44-371dc747bc95</a></td></tr><tr><td>Effective:</td><td> 30 March 2021 10:49:59 </td></tr><tr><td>Issued:</td><td>30/03/2021 10:49:59 AM</td></tr><tr><td>Value:</td><td>185.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/e1cc5f30-3a60-4232-be44-371dc747bc95',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-03-30T10:49:59+00:00',
        issued: '2021-03-30T10:49:59.000+00:00',
        valueQuantity: {
          value: 185,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/9e396c1d-4396-47aa-85ab-fa1ea989a7fe',
      resource: {
        resourceType: 'Observation',
        id: '9e396c1d-4396-47aa-85ab-fa1ea989a7fe',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>9e396c1d-4396-47aa-85ab-fa1ea989a7fe</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20">Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20</a></td></tr><tr><td>Effective:</td><td> 08 April 2021 14:44:24 </td></tr><tr><td>Issued:</td><td>08/04/2021 02:44:24 PM</td></tr><tr><td>Value:</td><td>172.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-04-08T14:44:24+00:00',
        issued: '2021-04-08T14:44:24.000+00:00',
        valueQuantity: {
          value: 172,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/801e6cbb-29d2-4581-9d6b-f75c1967351c',
      resource: {
        resourceType: 'Observation',
        id: '801e6cbb-29d2-4581-9d6b-f75c1967351c',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>801e6cbb-29d2-4581-9d6b-f75c1967351c</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb">Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb</a></td></tr><tr><td>Effective:</td><td> 10 May 2021 06:41:46 </td></tr><tr><td>Issued:</td><td>10/05/2021 06:41:46 AM</td></tr><tr><td>Value:</td><td>198.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 198,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/ed9fc038-20a0-46ae-97b8-578b30d10774',
      resource: {
        resourceType: 'Observation',
        id: 'ed9fc038-20a0-46ae-97b8-578b30d10774',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>ed9fc038-20a0-46ae-97b8-578b30d10774</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/be82d122-367a-4121-9413-b967dc90fc71">Encounter/be82d122-367a-4121-9413-b967dc90fc71</a></td></tr><tr><td>Effective:</td><td> 26 May 2021 15:21:43 </td></tr><tr><td>Issued:</td><td>26/05/2021 03:21:43 PM</td></tr><tr><td>Value:</td><td>160.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/be82d122-367a-4121-9413-b967dc90fc71',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-26T15:21:43+00:00',
        issued: '2021-05-26T15:21:43.000+00:00',
        valueQuantity: {
          value: 160,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/bd8c5dcb-badd-4157-b825-a24e8753b6fe',
      resource: {
        resourceType: 'Observation',
        id: 'bd8c5dcb-badd-4157-b825-a24e8753b6fe',
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>bd8c5dcb-badd-4157-b825-a24e8753b6fe</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Exam </td></tr><tr><td>Code:</td><td> Height (cm) </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/8673ee4f-e2ab-4077-ba55-4980f408773e">John Wilson (Old Identification Number: 100GEJ)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/da76b284-df1f-4b18-9236-fb44e3d96823">Encounter/da76b284-df1f-4b18-9236-fb44e3d96823</a></td></tr><tr><td>Effective:</td><td> 18 June 2021 09:02:03 </td></tr><tr><td>Issued:</td><td>18/06/2021 09:02:04 AM</td></tr><tr><td>Value:</td><td>198.0 cm </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>272.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/da76b284-df1f-4b18-9236-fb44e3d96823',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-06-18T09:02:03+00:00',
        issued: '2021-06-18T09:02:04.000+00:00',
        valueQuantity: {
          value: 198,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
  ],
};

export const formattedBiometrics = [
  {
    id: '0',
    date: '12 - Aug - 2021, 01:23',
    weight: 90,
    height: 186,
    bmi: '26.0',
    muac: 17,
  },
  {
    id: '1',
    date: '18 - Jun - 2021, 12:02',
    weight: 80,
    height: 198,
    bmi: '20.4',
    muac: 23,
  },
  {
    id: '2',
    date: '10 - Jun - 2021, 04:40',
    weight: 50,
    bmi: null,
  },
  {
    id: '3',
    date: '26 - May - 2021, 06:21',
    weight: 61,
    height: 160,
    bmi: '23.8',
  },
  {
    id: '4',
    date: '10 - May - 2021, 09:41',
    weight: 90,
    height: 198,
    bmi: '23.0',
    muac: 25,
  },
  {
    id: '5',
    date: '08 - Apr - 2021, 05:44',
    weight: 67,
    height: 172,
    bmi: '22.6',
  },
  {
    id: '6',
    date: '30 - Mar - 2021, 01:49',
    weight: 87,
    height: 185,
    bmi: '25.4',
  },
  {
    id: '7',
    date: '23 - Mar - 2021, 09:39',
    weight: 99,
    height: 198,
    bmi: '25.3',
    muac: 24,
  },
  {
    id: '8',
    date: '18 - Mar - 2021, 01:42',
    weight: 90,
    height: 180,
    bmi: '27.8',
    muac: 25,
  },
  {
    id: '9',
    date: '17 - Mar - 2021, 09:34',
    weight: 77,
    height: 176,
    bmi: '24.9',
    muac: 25,
  },
  {
    id: '10',
    date: '16 - Mar - 2021, 11:17',
    weight: 198,
    height: 180,
    bmi: '61.1',
    muac: 23,
  },
  {
    id: '11',
    date: '14 - Mar - 2021, 12:37',
    weight: 88,
    height: 88,
    bmi: '113.6',
  },
  {
    id: '12',
    date: '10 - Mar - 2021, 04:44',
    height: 10,
    bmi: null,
  },
  {
    id: '13',
    date: '08 - Mar - 2021, 04:40',
    weight: 110,
    height: 198,
    bmi: '28.1',
    muac: 24,
  },
  {
    id: '14',
    date: '21 - Feb - 2021, 02:00',
    weight: 75,
    height: 185,
    bmi: '21.9',
  },
  {
    id: '15',
    date: '19 - Feb - 2021, 03:37',
    weight: 65,
    height: 189,
    bmi: '18.2',
  },
  {
    id: '16',
    date: '18 - Feb - 2021, 12:10',
    weight: 10,
    height: 10,
    bmi: '1000.0',
  },
  {
    id: '17',
    date: '11 - Feb - 2021, 09:41',
    weight: 75,
    height: 175,
    bmi: '24.5',
  },
  {
    id: '18',
    date: '20 - Jan - 2021, 12:58',
    weight: 104,
    height: 198,
    bmi: '26.5',
    muac: 22,
  },
  {
    id: '19',
    date: '19 - Jan - 2021, 02:21',
    weight: 70,
    bmi: null,
  },
  {
    id: '20',
    date: '04 - Jan - 2021, 03:36',
    weight: 75,
    height: 165,
    bmi: '27.5',
    muac: 22,
  },
  {
    id: '21',
    date: '10 - Dec - 2020, 01:07',
    weight: 75,
    height: 165,
    bmi: '27.5',
    muac: 23,
  },
  {
    id: '22',
    date: '09 - Dec - 2020, 04:25',
    weight: 90,
    height: 199,
    bmi: '22.7',
    muac: 23,
  },
  {
    id: '23',
    date: '08 - Dec - 2020, 07:57',
    weight: 65,
    height: 175,
    bmi: '21.2',
    muac: 15,
  },
  {
    id: '24',
    date: '08 - Dec - 2020, 02:46',
    weight: 73,
    height: 185,
    bmi: '21.3',
  },
  {
    id: '25',
    date: '08 - Dec - 2020, 08:34',
    weight: 75,
    height: 165,
    bmi: '27.5',
  },
  {
    id: '26',
    date: '08 - Dec - 2020, 08:32',
    weight: 75,
    height: 165,
    bmi: '27.5',
  },
];

export const mockConceptMetadata = [
  {
    uuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Systolic',
    hiNormal: 140,
    hiAbsolute: 250,
    hiCritical: 180,
    lowNormal: 100,
    lowAbsolute: 0,
    lowCritical: 85,
    units: 'mmHg',
  },
];

export const mockVitalData = [
  {
    id: 'e8a96dcc-5bb6-4975-be3b-214440e34fa4',
    date: '2016-05-16T06:13:36.000+00:00',
    systolic: 161,
    diastolic: 72,
    pulse: 22,
    temperature: 37,
    oxygenSaturation: 30,
  },
  {
    id: 'd821eb55-1ba8-49c3-9ac8-95882744bd27',
    date: '2015-08-25T06:30:35.000+00:00',
    systolic: 120,
    diastolic: 80,
    pulse: 60,
    temperature: 38,
    oxygenSaturation: 93,
  },
  {
    id: 'dda59d9c-1544-4736-80cc-4a87d9b69cfa',
    date: '2015-09-20T06:30:35.000+00:00',
    systolic: 130,
    diastolic: 90,
    pulse: 65,
    temperature: 36,
    oxygenSaturation: 42,
  },
  {
    id: '4133736c-24f7-4971-84e7-986e22cb77b5',
    date: '2015-10-02T06:30:35.000+00:00',
    systolic: 127,
    diastolic: 145,
    pulse: 210,
    temperature: 43,
    oxygenSaturation: 45,
  },
  {
    id: '33f7aff0-07aa-449c-ab89-e8c0fe066adb',
    date: '2016-05-29T06:13:36.000+00:00',
    systolic: 138,
    diastolic: 90,
    pulse: 112,
    temperature: 33,
    oxygenSaturation: 78,
  },
  {
    id: 'b3829daf-081b-4837-a2b6-21878a184faf',
    date: '2015-04-04T06:30:35.000+00:00',
    systolic: 135,
    diastolic: 68,
    pulse: 215,
    temperature: 38,
    oxygenSaturation: 54,
  },
  {
    id: 'bd54ef4d-c118-4413-8e3e-edfc66afc851',
    date: '2015-11-12T06:30:35.000+00:00',
    systolic: 99,
    diastolic: 46,
    pulse: 53,
    temperature: 36,
    oxygenSaturation: 50,
  },
  {
    id: '41ca9a59-1e61-43ab-b990-c985647fc203',
    date: '2015-06-14T06:30:35.000+00:00',
    systolic: 113,
    diastolic: 96,
    pulse: 189,
    temperature: 39,
    oxygenSaturation: 20,
  },
  {
    id: '732d01c5-218a-4738-846a-a07326bb9ebb',
    date: '2016-01-15T06:13:36.000+00:00',
    systolic: 75,
    diastolic: 59,
    pulse: 193,
    temperature: 33,
    oxygenSaturation: 36,
  },
  {
    id: '52c1a328-083d-48c4-b450-7457650e10f9',
    date: '2015-08-30T06:30:35.000+00:00',
    systolic: 113,
    diastolic: 116,
    pulse: 175,
    temperature: 36,
    oxygenSaturation: 80,
  },
  {
    id: '43fea836-6c82-4df2-9bf1-dd07b6c54651',
    date: '2015-09-30T06:30:35.000+00:00',
    systolic: 154,
    diastolic: 113,
    pulse: 157,
    temperature: 27,
    oxygenSaturation: 31,
  },
  {
    id: '4a5e857f-4bce-4dea-be3b-1d789e125ff9',
    date: '2015-03-05T06:30:35.000+00:00',
    systolic: 176,
    diastolic: 107,
    pulse: 94,
    temperature: 42,
    oxygenSaturation: 57,
  },
  {
    id: 'b8375c83-b4c1-4291-9561-d3fb38373cee',
    date: '2016-06-26T06:13:36.000+00:00',
    systolic: 166,
    diastolic: 70,
    pulse: 85,
    temperature: 37,
    oxygenSaturation: 39,
  },
  {
    id: '957e943e-69ca-4378-ad7c-9d76fb11c743',
    date: '2017-01-18T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: '115ea6af-92e7-4846-a763-1c4b229feb8b',
    date: '2017-03-13T06:30:35.000+00:00',
    systolic: 146,
    diastolic: 50,
    pulse: 124,
    temperature: 34,
    oxygenSaturation: 40,
  },
  {
    id: '2370f007-0bed-4623-8803-614714e04ec9',
    date: '2017-01-31T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: '92f19d94-155b-4aa0-be96-d39149b7bb30',
    date: '2017-04-16T06:13:36.000+00:00',
    systolic: 150,
    diastolic: 92,
    pulse: 130,
    temperature: 37,
    oxygenSaturation: 45,
  },
  {
    id: '93de8c68-7a67-4ea4-9080-ccf6cee13226',
    date: '2017-05-25T06:30:35.000+00:00',
    systolic: 186,
    diastolic: 97,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: '30eaff83-1e8c-4059-8b70-7a9aa76709fb',
    date: '2017-05-19T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: 'c141b84c-eb37-49dd-af55-5c46372461d9',
    date: '2017-04-11T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: 'e1cbd2b8-77b7-4bfc-a019-cad45155a6ac',
    date: '2016-05-16T06:13:36.000+00:00',
    systolic: 163,
    diastolic: 75,
    pulse: 122,
    temperature: 37,
    oxygenSaturation: 43,
  },
  {
    id: '708aa53f-22fd-4b83-b055-7160ed3c3b47',
    date: '2017-08-09T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: 'da6060ef-bfc2-41e9-97c3-405da77fd3b9',
    date: '2015-11-10T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: 'abbe10e0-37ca-489b-9133-00b605c85a3f',
    date: '2015-08-29T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: '98124239-ca1e-4772-b00a-3ac442233984',
    date: '2016-05-20T06:13:36.000+00:00',
    systolic: 155,
    diastolic: 79,
    pulse: 115,
    temperature: 37,
    oxygenSaturation: 44,
  },
  {
    id: '5e0eb81b-c7da-477a-a031-cd9197614a0d',
    date: '2016-09-27T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: 'aa94b33a-65b9-4fe7-a6e6-34ecbfab3bc4',
    date: '2015-12-01T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: '1b776ac0-3715-4252-af65-54e60efd32ab',
    date: '2016-03-22T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: '530d2216-6acb-4573-9625-2683f523f5a3',
    date: '2016-10-16T06:13:36.000+00:00',
    systolic: 161,
    diastolic: 72,
    pulse: 135,
    temperature: 37,
    oxygenSaturation: 54,
  },
  {
    id: '419c7ae0-c13d-4114-a145-f3952bf2d9a6',
    date: '2017-05-25T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: '74c650f2-3bc4-4144-ba13-7e1fbc853d7e',
    date: '2017-01-12T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
  {
    id: 'cfcec828-16f8-44e9-8a89-a872680c6f75',
    date: '2017-02-02T06:30:35.000+00:00',
    systolic: 156,
    diastolic: 64,
    pulse: 173,
    temperature: 37,
    oxygenSaturation: 41,
  },
];

export const mockVitalSigns = mockVitalData[0];

export const mockVitalsSignsConcept = {
  data: {
    results: [
      {
        setMembers: [
          {
            uuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Systolic blood pressure',
            hiNormal: 120,
            hiAbsolute: 250.0,
            hiCritical: null,
            lowNormal: 80,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'mmHg',
          },
          {
            uuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Diastolic blood pressure',
            hiNormal: 80,
            hiAbsolute: 150.0,
            hiCritical: null,
            lowNormal: 70,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'mmHg',
          },
          {
            uuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Temperature (C)',
            hiNormal: 37.5,
            hiAbsolute: 43.0,
            hiCritical: null,
            lowNormal: 36.5,
            lowAbsolute: 25.0,
            lowCritical: null,
            units: 'DEG C',
          },
          {
            uuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Height (cm)',
            hiNormal: null,
            hiAbsolute: 272.0,
            hiCritical: null,
            lowNormal: null,
            lowAbsolute: 10.0,
            lowCritical: null,
            units: 'cm',
          },
          {
            uuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Weight (kg)',
            hiNormal: null,
            hiAbsolute: 250.0,
            hiCritical: null,
            lowNormal: null,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'kg',
          },
          {
            uuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Pulse',
            hiNormal: 70,
            hiAbsolute: 230.0,
            hiCritical: null,
            lowNormal: 30,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'beats/min',
          },
          {
            uuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Blood oxygen saturation',
            hiNormal: 100,
            hiAbsolute: 100.0,
            hiCritical: null,
            lowNormal: 95,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: '%',
          },
          {
            uuid: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'MID-UPPER ARM CIRCUMFERENCE',
            hiNormal: 25,
            hiAbsolute: null,
            hiCritical: null,
            lowNormal: 23,
            lowAbsolute: null,
            lowCritical: null,
            units: 'cm',
          },
          {
            uuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Respiratory rate',
            hiNormal: 70.0,
            hiAbsolute: 999.0,
            hiCritical: 120.0,
            lowNormal: null,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'breaths/min',
          },
        ],
      },
    ],
  },
};

export const mockVitalsChartData = [
  {
    id: '0158ad38-d3f4-492a-9e46-1c1e6909c64f',
    date: new Date('2020-12-08'),
    systolic: '129',
    diastolic: '85',
    pulse: '74',
    temperature: '37.9',
    oxygenSaturation: '99',
    weight: '73',
    height: '185',
    bmi: '21.3',
    respiratoryRate: '16',
  },
  {
    id: '0158ad38-d3f4-492a-9e46-1c1e6909c64f',
    date: new Date('2020-11-08'),
    systolic: '125',
    diastolic: '80',
    pulse: '80',
    temperature: '36.9',
    oxygenSaturation: '95',
    weight: '75',
    height: '165',
    bmi: '21.3',
    respiratoryRate: '16',
  },
];

export const mockVitalsConceptsUnits = {
  vitalsSignsConceptMetadata: mockVitalsSignsConcept.data.results,
  conceptsUnits: ['mmHg', 'mmHg', 'DEG C', 'cm', 'kg', 'beats/min', '%', 'cm', '/ min'],
};

export const mockFhirVitalsResponse = {
  resourceType: 'Bundle',
  id: '24e26621-7a9c-432d-9a76-bd1ea6ef7a4f',
  meta: {
    lastUpdated: '2021-05-25T20:03:47.273+00:00',
    tag: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
        code: 'SUBSETTED',
        display: 'Resource encoded in summary mode',
      },
    ],
  },
  type: 'searchset',
  total: 20,
  link: [
    {
      relation: 'self',
      url: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation?_count=100&_sort=-date&_summary=data&code=5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2C5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&subject%3APatient=8673ee4f-e2ab-4077-ba55-4980f408773e',
    },
    {
      relation: 'next',
      url: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4?_getpages=c4170e17-5619-4399-8697-db4f4d9e3611&_getpagesoffset=100&_count=100&_bundletype=searchset',
    },
  ],
  entry: [
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/52b1e1fd-6aee-496b-8a08-261b10fd297d',
      resource: {
        resourceType: 'Observation',
        id: '52b1e1fd-6aee-496b-8a08-261b10fd297d',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Pulse',
            },
            {
              system: 'http://loinc.org',
              code: '8867-4',
              display: 'Pulse',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/53c7d819-6d24-4696-be95-1d9a5a517ef6',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-19T04:26:51+00:00',
        issued: '2021-05-19T04:26:51.000+00:00',
        valueQuantity: {
          value: 76,
          unit: 'beats/min',
        },
        referenceRange: [
          {
            low: {
              value: 55,
            },
            high: {
              value: 100,
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
              value: 49,
            },
            high: {
              value: 130,
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
              value: 230,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/753d1b65-f59d-48c7-a1e8-854d6e1e41bd',
      resource: {
        resourceType: 'Observation',
        id: '753d1b65-f59d-48c7-a1e8-854d6e1e41bd',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Temperature (C)',
            },
            {
              system: 'http://loinc.org',
              code: '8310-5',
              display: 'Temperature (C)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/53c7d819-6d24-4696-be95-1d9a5a517ef6',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-19T04:26:51+00:00',
        issued: '2021-05-19T04:26:51.000+00:00',
        valueQuantity: {
          value: 37,
          unit: 'DEG C',
        },
        referenceRange: [
          {
            low: {
              value: 25,
            },
            high: {
              value: 43,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/53fe0efa-d238-445c-997a-5ce521ed6168',
      resource: {
        resourceType: 'Observation',
        id: '53fe0efa-d238-445c-997a-5ce521ed6168',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Respiratory rate',
            },
            {
              system: 'http://loinc.org',
              code: '9279-1',
              display: 'Respiratory rate',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/53c7d819-6d24-4696-be95-1d9a5a517ef6',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-19T04:26:51+00:00',
        issued: '2021-05-19T04:26:51.000+00:00',
        valueQuantity: {
          value: 12,
          unit: 'breaths/min',
        },
        referenceRange: [
          {
            low: {
              value: 12,
            },
            high: {
              value: 18,
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
              value: 8,
            },
            high: {
              value: 26,
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
              value: 999,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/f4f02303-7483-46f1-bf60-56ac3314a2d4',
      resource: {
        resourceType: 'Observation',
        id: 'f4f02303-7483-46f1-bf60-56ac3314a2d4',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diastolic',
            },
            {
              system: 'http://loinc.org',
              code: '35094-2',
              display: 'Diastolic',
            },
            {
              system: 'http://loinc.org',
              code: '8462-4',
              display: 'Diastolic',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/53c7d819-6d24-4696-be95-1d9a5a517ef6',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-19T04:26:51+00:00',
        issued: '2021-05-19T04:26:51.000+00:00',
        valueQuantity: {
          value: 89,
          unit: 'mmHg',
        },
        referenceRange: [
          {
            low: {
              value: 55,
            },
            high: {
              value: 90,
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
              value: 40,
            },
            high: {
              value: 120,
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
              value: 150,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/9719c60f-61ba-4a8c-b314-2c242a1a72a0',
      resource: {
        resourceType: 'Observation',
        id: '9719c60f-61ba-4a8c-b314-2c242a1a72a0',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Systolic',
            },
            {
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/53c7d819-6d24-4696-be95-1d9a5a517ef6',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-19T04:26:51+00:00',
        issued: '2021-05-19T04:26:51.000+00:00',
        valueQuantity: {
          value: 121,
          unit: 'mmHg',
        },
        referenceRange: [
          {
            low: {
              value: 100,
            },
            high: {
              value: 140,
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
              value: 85,
            },
            high: {
              value: 180,
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
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/a21ce97d-1834-4bd0-b292-96da2f7195ad',
      resource: {
        resourceType: 'Observation',
        id: 'a21ce97d-1834-4bd0-b292-96da2f7195ad',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Respiratory rate',
            },
            {
              system: 'http://loinc.org',
              code: '9279-1',
              display: 'Respiratory rate',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 45,
          unit: 'breaths/min',
        },
        referenceRange: [
          {
            low: {
              value: 12,
            },
            high: {
              value: 18,
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
              value: 8,
            },
            high: {
              value: 26,
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
              value: 999,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/0a1f6a92-30a4-47b9-8add-5237d807f8a9',
      resource: {
        resourceType: 'Observation',
        id: '0a1f6a92-30a4-47b9-8add-5237d807f8a9',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Systolic',
            },
            {
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 120,
          unit: 'mmHg',
        },
        referenceRange: [
          {
            low: {
              value: 100,
            },
            high: {
              value: 140,
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
              value: 85,
            },
            high: {
              value: 180,
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
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/801e6cbb-29d2-4581-9d6b-f75c1967351c',
      resource: {
        resourceType: 'Observation',
        id: '801e6cbb-29d2-4581-9d6b-f75c1967351c',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 198,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/5cd10d94-6322-45f1-ac2c-f595d2a81941',
      resource: {
        resourceType: 'Observation',
        id: '5cd10d94-6322-45f1-ac2c-f595d2a81941',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diastolic',
            },
            {
              system: 'http://loinc.org',
              code: '35094-2',
              display: 'Diastolic',
            },
            {
              system: 'http://loinc.org',
              code: '8462-4',
              display: 'Diastolic',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 90,
          unit: 'mmHg',
        },
        referenceRange: [
          {
            low: {
              value: 55,
            },
            high: {
              value: 90,
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
              value: 40,
            },
            high: {
              value: 120,
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
              value: 150,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/6cef1000-1f29-4dab-9588-5d5cd230ee95',
      resource: {
        resourceType: 'Observation',
        id: '6cef1000-1f29-4dab-9588-5d5cd230ee95',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Pulse',
            },
            {
              system: 'http://loinc.org',
              code: '8867-4',
              display: 'Pulse',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 66,
          unit: 'beats/min',
        },
        referenceRange: [
          {
            low: {
              value: 55,
            },
            high: {
              value: 100,
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
              value: 49,
            },
            high: {
              value: 130,
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
              value: 230,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/e5f5fd79-1545-4808-9ac0-a6dd38c258fb',
      resource: {
        resourceType: 'Observation',
        id: 'e5f5fd79-1545-4808-9ac0-a6dd38c258fb',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 90,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/46db2c12-2510-4c40-a0d9-561031f2604a',
      resource: {
        resourceType: 'Observation',
        id: '46db2c12-2510-4c40-a0d9-561031f2604a',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Temperature (C)',
            },
            {
              system: 'http://loinc.org',
              code: '8310-5',
              display: 'Temperature (C)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 37,
          unit: 'DEG C',
        },
        referenceRange: [
          {
            low: {
              value: 25,
            },
            high: {
              value: 43,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/21fe5808-618a-4570-8ed1-1269d14ac0f3',
      resource: {
        resourceType: 'Observation',
        id: '21fe5808-618a-4570-8ed1-1269d14ac0f3',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
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
              code: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Arterial blood oxygen saturation (pulse oximeter)',
            },
            {
              system: 'http://loinc.org',
              code: '2710-2',
              display: 'Arterial blood oxygen saturation (pulse oximeter)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/71a9faed-1102-4ab6-b412-06b7de69eceb',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-10T06:41:46+00:00',
        issued: '2021-05-10T06:41:46.000+00:00',
        valueQuantity: {
          value: 90,
          unit: '%',
        },
        referenceRange: [
          {
            low: {
              value: 92,
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
              value: 89,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/9469ec9c-ade7-4424-b940-2238717c104c',
      resource: {
        resourceType: 'Observation',
        id: '9469ec9c-ade7-4424-b940-2238717c104c',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Diastolic',
            },
            {
              system: 'http://loinc.org',
              code: '35094-2',
              display: 'Diastolic',
            },
            {
              system: 'http://loinc.org',
              code: '8462-4',
              display: 'Diastolic',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b524d4c6-2426-4af1-a8e5-e03379286968',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-07T09:04:51+00:00',
        issued: '2021-05-07T09:04:51.000+00:00',
        valueQuantity: {
          value: 80,
          unit: 'mmHg',
        },
        referenceRange: [
          {
            low: {
              value: 55,
            },
            high: {
              value: 90,
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
              value: 40,
            },
            high: {
              value: 120,
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
              value: 150,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/d58614c6-a824-4a36-97ff-8e2969f1d776',
      resource: {
        resourceType: 'Observation',
        id: 'd58614c6-a824-4a36-97ff-8e2969f1d776',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Systolic',
            },
            {
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b524d4c6-2426-4af1-a8e5-e03379286968',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-05-07T09:04:51+00:00',
        issued: '2021-05-07T09:04:51.000+00:00',
        valueQuantity: {
          value: 120,
          unit: 'mmHg',
        },
        referenceRange: [
          {
            low: {
              value: 100,
            },
            high: {
              value: 140,
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
              value: 85,
            },
            high: {
              value: 180,
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
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/9e396c1d-4396-47aa-85ab-fa1ea989a7fe',
      resource: {
        resourceType: 'Observation',
        id: '9e396c1d-4396-47aa-85ab-fa1ea989a7fe',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Height (cm)',
            },
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Height (cm)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-04-08T14:44:24+00:00',
        issued: '2021-04-08T14:44:24.000+00:00',
        valueQuantity: {
          value: 172,
          unit: 'cm',
        },
        referenceRange: [
          {
            low: {
              value: 10,
            },
            high: {
              value: 272,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/46f73822-f7a7-4bea-9241-5354598128e2',
      resource: {
        resourceType: 'Observation',
        id: '46f73822-f7a7-4bea-9241-5354598128e2',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Weight (kg)',
            },
            {
              system: 'http://loinc.org',
              code: '3141-9',
              display: 'Weight (kg)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-04-08T14:44:24+00:00',
        issued: '2021-04-08T14:44:24.000+00:00',
        valueQuantity: {
          value: 67,
          unit: 'kg',
        },
        referenceRange: [
          {
            low: {
              value: 0,
            },
            high: {
              value: 250,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/c8f081e5-05d1-477d-bc8a-a81aba342be6',
      resource: {
        resourceType: 'Observation',
        id: 'c8f081e5-05d1-477d-bc8a-a81aba342be6',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Temperature (C)',
            },
            {
              system: 'http://loinc.org',
              code: '8310-5',
              display: 'Temperature (C)',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-04-08T14:44:24+00:00',
        issued: '2021-04-08T14:44:24.000+00:00',
        valueQuantity: {
          value: 36.5,
          unit: 'DEG C',
        },
        referenceRange: [
          {
            low: {
              value: 25,
            },
            high: {
              value: 43,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/53a9e3b2-a352-48db-90ce-9a1f93f4e68d',
      resource: {
        resourceType: 'Observation',
        id: '53a9e3b2-a352-48db-90ce-9a1f93f4e68d',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Pulse',
            },
            {
              system: 'http://loinc.org',
              code: '8867-4',
              display: 'Pulse',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-04-08T14:44:24+00:00',
        issued: '2021-04-08T14:44:24.000+00:00',
        valueQuantity: {
          value: 78,
          unit: 'beats/min',
        },
        referenceRange: [
          {
            low: {
              value: 55,
            },
            high: {
              value: 100,
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
              value: 49,
            },
            high: {
              value: 130,
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
              value: 230,
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
      },
    },
    {
      fullUrl: 'https://openmrs-spa.org/openmrs/ws/fhir2//R4/Observation/bf734cba-d5c5-4139-a065-b77de4e9d5d3',
      resource: {
        resourceType: 'Observation',
        id: 'bf734cba-d5c5-4139-a065-b77de4e9d5d3',
        meta: {
          tag: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
              code: 'SUBSETTED',
              display: 'Resource encoded in summary mode',
            },
          ],
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Respiratory rate',
            },
            {
              system: 'http://loinc.org',
              code: '9279-1',
              display: 'Respiratory rate',
            },
          ],
        },
        subject: {
          reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e',
          type: 'Patient',
          display: 'John Wilson (Old Identification Number: 100GEJ)',
        },
        encounter: {
          reference: 'Encounter/b5e913b6-a6cb-4be1-ac5c-173580558d20',
          type: 'Encounter',
        },
        effectiveDateTime: '2021-04-08T14:44:24+00:00',
        issued: '2021-04-08T14:44:24.000+00:00',
        valueQuantity: {
          value: 65,
          unit: 'breaths/min',
        },
        referenceRange: [
          {
            low: {
              value: 12,
            },
            high: {
              value: 18,
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
              value: 8,
            },
            high: {
              value: 26,
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
              value: 999,
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
      },
    },
  ],
};

export const mockVitalsConfig = {
  biometrics: { bmiUnit: 'kg / m²' },
  concepts: {
    diastolicBloodPressureUuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    generalPatientNoteUuid: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    midUpperArmCircumferenceUuid: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    oxygenSaturationUuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    pulseUuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    respiratoryRateUuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    systolicBloodPressureUuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    temperatureUuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  vitals: {
    encounterTypeUuid: '67a71486-1a54-468f-ac3e-7091a9a79584',
    formUuid: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
    useFormEngine: false,
  },
};

export const formattedVitals = [
  {
    id: '6f4ed885-2bc1-4ed4-92e5-3dddb9180f30',
    date: '19 - May - 2021, 07:26',
    bloodPressure: '125 / 93',
    pulse: 76,
    spo2: undefined,
    temperature: 37,
    respiratoryRate: 12,
  },
  {
    id: 'dab186be-0058-41c6-9c8e-ceeff09ef162',
    date: '10 - May - 2021, 09:41',
    bloodPressure: '120 / 85',
    pulse: 66,
    spo2: 90,
    temperature: 37,
    respiratoryRate: 45,
  },
  {
    id: 'fd4a9e7b-4bb4-4a41-b8c5-44393097df6c',
    date: '07 - May - 2021, 12:04',
    bloodPressure: '107 / 90',
    pulse: undefined,
    spo2: undefined,
    temperature: undefined,
    respiratoryRate: undefined,
  },
];

export const mockConceptUnits = ['mmHg', 'mmHg', 'DEG C', 'cm', 'kg', 'beats/min', '%', 'cm', 'breaths/min'];

export const mockVitalsConceptMetadata = mockVitalsSignsConcept.data.results[0].setMembers;
