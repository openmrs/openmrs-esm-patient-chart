export const observationData = [
  {
    data: {
      resourceType: 'Bundle',
      id: '78458fa9-92c6-479c-a014-4e443adb88de',
      meta: {
        lastUpdated: '2022-10-18T10:24:56.928+00:00',
      },
      type: 'searchset',
      total: 18,
      link: [
        {
          relation: 'self',
          url: 'http://localhost/openmrs/ws/fhir2/R4/Observation?_count=100&category=laboratory&patient=0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
        },
      ],
      entry: [
        {
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/9d84d9da-03cf-44fd-9478-882d278fbd7e',
          resource: {
            resourceType: 'Observation',
            id: '9d84d9da-03cf-44fd-9478-882d278fbd7e',
            meta: {
              lastUpdated: '2022-10-18T10:21:09.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>9d84d9da-03cf-44fd-9478-882d278fbd7e</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Kinyoun\'s stain for coccidians</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:20:16 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:21:09 AM</td></tr><tr><td>Value:</td><td>Appearance of bright red coccidia oocysts against a blue background.</td></tr></tbody></table></div>',
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
                  code: '161448AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: "Kinyoun's stain for coccidians",
                },
              ],
              text: "Kinyoun's stain for coccidians",
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:20:16+00:00',
            issued: '2022-10-18T10:21:09.000+00:00',
            valueString: 'Appearance of bright red coccidia oocysts against a blue background.',
          },
        },
        {
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/6882cad2-3cbf-4262-baa0-6df4b4454ed5',
          resource: {
            resourceType: 'Observation',
            id: '6882cad2-3cbf-4262-baa0-6df4b4454ed5',
            meta: {
              lastUpdated: '2022-10-18T10:21:09.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>6882cad2-3cbf-4262-baa0-6df4b4454ed5</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Stool microscopy with concentration</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:20:16 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:21:09 AM</td></tr><tr><td>Value:</td><td>Separate parasites from fecal debris.</td></tr></tbody></table></div>',
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
                  code: '161447AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Stool microscopy with concentration',
                },
              ],
              text: 'Stool microscopy with concentration',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:20:16+00:00',
            issued: '2022-10-18T10:21:09.000+00:00',
            valueString: 'Separate parasites from fecal debris.',
          },
        },
        {
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/e216dee6-6a0d-437f-bf46-ec3d9c5c1de2',
          resource: {
            resourceType: 'Observation',
            id: 'e216dee6-6a0d-437f-bf46-ec3d9c5c1de2',
            meta: {
              lastUpdated: '2022-10-18T10:21:09.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>e216dee6-6a0d-437f-bf46-ec3d9c5c1de2</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Fecal occult blood test</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:20:16 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:21:09 AM</td></tr><tr><td>Value:</td><td>Negative</td></tr></tbody></table></div>',
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
                  code: '159362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Fecal occult blood test',
                },
              ],
              text: 'Fecal occult blood test',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:20:16+00:00',
            issued: '2022-10-18T10:21:09.000+00:00',
            valueCodeableConcept: {
              coding: [
                {
                  code: '664AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Negative',
                },
              ],
              text: 'Negative',
            },
          },
        },
        {
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/8c7fc271-0a04-4203-8afc-92aa99f5a78f',
          resource: {
            resourceType: 'Observation',
            id: '8c7fc271-0a04-4203-8afc-92aa99f5a78f',
            meta: {
              lastUpdated: '2022-10-18T10:21:09.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>8c7fc271-0a04-4203-8afc-92aa99f5a78f</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Stool exam</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:20:16 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:21:09 AM</td></tr><tr><td>Value:</td><td>Positive</td></tr></tbody></table></div>',
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
                  code: '304AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Stool exam',
                },
              ],
              text: 'Stool exam',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:20:16+00:00',
            issued: '2022-10-18T10:21:09.000+00:00',
            valueCodeableConcept: {
              coding: [
                {
                  code: '703AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Positive',
                },
              ],
              text: 'Positive',
            },
          },
        },
        {
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/cf3fd0dd-a3d6-41c9-924f-431c1b75ef2b',
          resource: {
            resourceType: 'Observation',
            id: 'cf3fd0dd-a3d6-41c9-924f-431c1b75ef2b',
            meta: {
              lastUpdated: '2022-10-18T10:21:09.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>cf3fd0dd-a3d6-41c9-924f-431c1b75ef2b</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Stool test for reducing substance</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:20:16 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:21:09 AM</td></tr><tr><td>Value:</td><td>Negative</td></tr></tbody></table></div>',
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
                  code: '161449AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Stool test for reducing substance',
                },
              ],
              text: 'Stool test for reducing substance',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:20:16+00:00',
            issued: '2022-10-18T10:21:09.000+00:00',
            valueCodeableConcept: {
              coding: [
                {
                  code: '664AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Negative',
                },
              ],
              text: 'Negative',
            },
          },
        },
        {
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/e928bee9-b47e-4678-b43e-6d6424a7d989',
          resource: {
            resourceType: 'Observation',
            id: 'e928bee9-b47e-4678-b43e-6d6424a7d989',
            meta: {
              lastUpdated: '2022-10-18T10:21:09.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>e928bee9-b47e-4678-b43e-6d6424a7d989</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Stool fat test, semi-quantitative</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:20:16 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:21:09 AM</td></tr><tr><td>Value:</td><td>Positive</td></tr></tbody></table></div>',
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
                  code: '161450AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Stool fat test, semi-quantitative',
                },
              ],
              text: 'Stool fat test, semi-quantitative',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:20:16+00:00',
            issued: '2022-10-18T10:21:09.000+00:00',
            valueCodeableConcept: {
              coding: [
                {
                  code: '703AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Positive',
                },
              ],
              text: 'Positive',
            },
          },
        },
        {
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/74907b27-4e6f-4d31-8917-f4352d8b99fd',
          resource: {
            resourceType: 'Observation',
            id: '74907b27-4e6f-4d31-8917-f4352d8b99fd',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>74907b27-4e6f-4d31-8917-f4352d8b99fd</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Mean cell hemoglobin concentration</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>5.0 g/dL </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>33.0 </td><td>37.0 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>0.0 </td><td/><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '1017AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Mean cell hemoglobin concentration',
                },
                {
                  system: 'http://snomed.info/sct',
                  code: '37254006',
                  display: 'Mean cell hemoglobin concentration',
                },
              ],
              text: 'Mean cell hemoglobin concentration',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 5.0,
              unit: 'g/dL',
              system: 'http://unitsofmeasure.org',
              code: 'g/dL',
            },
            referenceRange: [
              {
                low: {
                  value: 33.0,
                },
                high: {
                  value: 37.0,
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
                  value: 0.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/3ca1e8d0-1d99-479a-a248-ef86cfca1f05',
          resource: {
            resourceType: 'Observation',
            id: '3ca1e8d0-1d99-479a-a248-ef86cfca1f05',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>3ca1e8d0-1d99-479a-a248-ef86cfca1f05</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>White blood cells</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>12.0 10^3/uL </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>4.0 </td><td>11.0 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>1.4 </td><td/><td> treatment </td><td/><td> - </td></tr><tr><td>3</td><td>0.0 </td><td/><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '678AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'White blood cells',
                },
                {
                  system: 'http://snomed.info/sct',
                  code: '391558003',
                  display: 'White blood cells',
                },
              ],
              text: 'White blood cells',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 12.0,
              unit: '10^3/uL',
              system: 'http://unitsofmeasure.org',
              code: '10^3/uL',
            },
            referenceRange: [
              {
                low: {
                  value: 4.0,
                },
                high: {
                  value: 11.0,
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
                  value: 1.4,
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
                  value: 0.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/0e53b25b-a71e-4bae-8ee6-a4af5b38b5e6',
          resource: {
            resourceType: 'Observation',
            id: '0e53b25b-a71e-4bae-8ee6-a4af5b38b5e6',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>0e53b25b-a71e-4bae-8ee6-a4af5b38b5e6</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Mean corpuscular volume</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:38 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>7.0 fL </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>80.0 </td><td>100.0 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>0.0 </td><td/><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '851AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Mean corpuscular volume',
                },
              ],
              text: 'Mean corpuscular volume',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:38+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 7.0,
              unit: 'fL',
              system: 'http://unitsofmeasure.org',
              code: 'fL',
            },
            referenceRange: [
              {
                low: {
                  value: 80.0,
                },
                high: {
                  value: 100.0,
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
                  value: 0.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/7bb9d5db-f6bf-4336-8eef-85d11020a222',
          resource: {
            resourceType: 'Observation',
            id: '7bb9d5db-f6bf-4336-8eef-85d11020a222',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>7bb9d5db-f6bf-4336-8eef-85d11020a222</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Red blood cells</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>10.0 10^6/uL </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>4.0 </td><td>6.1 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>2.3 </td><td/><td> treatment </td><td/><td> - </td></tr><tr><td>3</td><td>0.0 </td><td/><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '679AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Red blood cells',
                },
                {
                  system: 'http://snomed.info/sct',
                  code: '14089001',
                  display: 'Red blood cells',
                },
              ],
              text: 'Red blood cells',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 10.0,
              unit: '10^6/uL',
              system: 'http://unitsofmeasure.org',
              code: '10^6/uL',
            },
            referenceRange: [
              {
                low: {
                  value: 4.0,
                },
                high: {
                  value: 6.1,
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
                  value: 2.3,
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
                  value: 0.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/9452bf16-67df-4a64-a0bb-9c83fcfe3691',
          resource: {
            resourceType: 'Observation',
            id: '9452bf16-67df-4a64-a0bb-9c83fcfe3691',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>9452bf16-67df-4a64-a0bb-9c83fcfe3691</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Hematocrit</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>3.0 % </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>32.3 </td><td>51.9 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>21.0 </td><td/><td> treatment </td><td/><td> - </td></tr><tr><td>3</td><td>0.0 </td><td>100.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '1015AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Hematocrit',
                },
              ],
              text: 'Hematocrit',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 3.0,
              unit: '%',
              system: 'http://unitsofmeasure.org',
              code: '%',
            },
            referenceRange: [
              {
                low: {
                  value: 32.3,
                },
                high: {
                  value: 51.9,
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
                  value: 21.0,
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
                  value: 0.0,
                },
                high: {
                  value: 100.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/f257005c-5d27-47b2-beac-fd0ef272dad3',
          resource: {
            resourceType: 'Observation',
            id: 'f257005c-5d27-47b2-beac-fd0ef272dad3',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>f257005c-5d27-47b2-beac-fd0ef272dad3</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Mean corpuscular hemoglobin</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>6.0 pg </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>26.0 </td><td>34.0 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>0.0 </td><td/><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '1018AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Mean corpuscular hemoglobin',
                },
              ],
              text: 'Mean corpuscular hemoglobin',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 6.0,
              unit: 'pg',
              system: 'http://unitsofmeasure.org',
              code: 'pg',
            },
            referenceRange: [
              {
                low: {
                  value: 26.0,
                },
                high: {
                  value: 34.0,
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
                  value: 0.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/91ca4a7d-b3bf-4c29-b258-b65084227d1f',
          resource: {
            resourceType: 'Observation',
            id: '91ca4a7d-b3bf-4c29-b258-b65084227d1f',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>91ca4a7d-b3bf-4c29-b258-b65084227d1f</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Combined % of monocytes, eosinophils and basophils</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>1.0 % </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>1.0 </td><td>10.0 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>0.0 </td><td>50.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '163426AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Combined % of monocytes, eosinophils and basophils',
                },
              ],
              text: 'Combined % of monocytes, eosinophils and basophils',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 1.0,
              unit: '%',
              system: 'http://unitsofmeasure.org',
              code: '%',
            },
            referenceRange: [
              {
                low: {
                  value: 1.0,
                },
                high: {
                  value: 10.0,
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
                  value: 0.0,
                },
                high: {
                  value: 50.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/5a86da08-a312-44c3-b8bc-39c3c499c8db',
          resource: {
            resourceType: 'Observation',
            id: '5a86da08-a312-44c3-b8bc-39c3c499c8db',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>5a86da08-a312-44c3-b8bc-39c3c499c8db</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Haemoglobin</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:38 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>2.0 g/dL </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.4 </td><td>17.8 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>7.0 </td><td/><td> treatment </td><td/><td> - </td></tr><tr><td>3</td><td>0.0 </td><td/><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Haemoglobin',
                },
              ],
              text: 'Haemoglobin',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:38+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 2.0,
              unit: 'g/dL',
              system: 'http://unitsofmeasure.org',
              code: 'g/dL',
            },
            referenceRange: [
              {
                low: {
                  value: 10.4,
                },
                high: {
                  value: 17.8,
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
                  value: 7.0,
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
                  value: 0.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/8e4080cb-6622-4b90-8495-71b23f0dcf32',
          resource: {
            resourceType: 'Observation',
            id: '8e4080cb-6622-4b90-8495-71b23f0dcf32',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>8e4080cb-6622-4b90-8495-71b23f0dcf32</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Lymphocytes (%) - microscopic exam</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>4.0 % </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>100.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '1338AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Lymphocytes (%) - microscopic exam',
                },
              ],
              text: 'Lymphocytes (%) - microscopic exam',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 4.0,
              unit: '%',
              system: 'http://unitsofmeasure.org',
              code: '%',
            },
            referenceRange: [
              {
                low: {
                  value: 0.0,
                },
                high: {
                  value: 100.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/2fae579f-313b-42c3-b30f-387958fae9d5',
          resource: {
            resourceType: 'Observation',
            id: '2fae579f-313b-42c3-b30f-387958fae9d5',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>2fae579f-313b-42c3-b30f-387958fae9d5</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Neutrophils (%) - microscopic exam</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:38 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>8.0 % </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>0.0 </td><td>100.0 </td><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '1336AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Neutrophils (%) - microscopic exam',
                },
              ],
              text: 'Neutrophils (%) - microscopic exam',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:38+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 8.0,
              unit: '%',
              system: 'http://unitsofmeasure.org',
              code: '%',
            },
            referenceRange: [
              {
                low: {
                  value: 0.0,
                },
                high: {
                  value: 100.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/33f30b79-82fd-478e-b57a-cb91f596df54',
          resource: {
            resourceType: 'Observation',
            id: '33f30b79-82fd-478e-b57a-cb91f596df54',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>33f30b79-82fd-478e-b57a-cb91f596df54</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Platelets</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>9.0 10^3/mL </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>134.0 </td><td>419.0 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>49.0 </td><td/><td> treatment </td><td/><td> - </td></tr><tr><td>3</td><td>0.0 </td><td/><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '729AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Platelets',
                },
              ],
              text: 'Platelets',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 9.0,
              unit: '10^3/mL',
              system: 'http://unitsofmeasure.org',
              code: '10^3/mL',
            },
            referenceRange: [
              {
                low: {
                  value: 134.0,
                },
                high: {
                  value: 419.0,
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
                  value: 49.0,
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
                  value: 0.0,
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
          fullUrl: 'http://localhost/openmrs/ws/fhir2/R4/Observation/90f43cd4-cf4f-4dd5-8341-11b8f9367cb6',
          resource: {
            resourceType: 'Observation',
            id: '90f43cd4-cf4f-4dd5-8341-11b8f9367cb6',
            meta: {
              lastUpdated: '2022-10-18T10:22:33.000+00:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>90f43cd4-cf4f-4dd5-8341-11b8f9367cb6</td></tr><tr><td>Status:</td><td>FINAL</td></tr><tr><td>Category:</td><td> Laboratory </td></tr><tr><td>Code:</td><td>Red cell distribution width</td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba">Jonathan Bosco (OpenMRS ID: 100001W)</a></td></tr><tr><td>Effective:</td><td> 18 October 2022 10:21:39 </td></tr><tr><td>Issued:</td><td>18/10/2022 10:22:33 AM</td></tr><tr><td>Value:</td><td>11.0 % </td></tr><tr><td>Reference Ranges:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Low</th><th>High</th><th>Type</th><th>Applies To</th><th>Age</th></tr><tr><td>1</td><td>10.0 </td><td>20.0 </td><td> normal </td><td/><td> - </td></tr><tr><td>2</td><td>0.0 </td><td/><td> absolute </td><td/><td> - </td></tr></tbody></table></td></tr></tbody></table></div>',
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
                  code: '1016AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Red cell distribution width',
                },
              ],
              text: 'Red cell distribution width',
            },
            subject: {
              reference: 'Patient/0508763a-a2d5-46eb-9d2e-1d0481bd23ba',
              type: 'Patient',
              display: 'Jonathan Bosco (OpenMRS ID: 100001W)',
            },
            effectiveDateTime: '2022-10-18T10:21:39+00:00',
            issued: '2022-10-18T10:22:33.000+00:00',
            valueQuantity: {
              value: 11.0,
              unit: '%',
              system: 'http://unitsofmeasure.org',
              code: '%',
            },
            referenceRange: [
              {
                low: {
                  value: 10.0,
                },
                high: {
                  value: 20.0,
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
                  value: 0.0,
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
    },
  },
];
