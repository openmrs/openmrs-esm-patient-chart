export const patient: fhir.Patient = {
  resourceType: "Patient",
  id: "8673ee4f-e2ab-4077-ba55-4980f408773e",
  extension: [
    {
      url:
        "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
      valueDateTime: "2017-01-18T09:42:40+00:00"
    },
    {
      url:
        "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
      valueString: "daemon"
    }
  ],
  identifier: [
    {
      id: "1f0ad7a1-430f-4397-b571-59ea654a52db",
      use: "usual",
      system: "OpenMRS ID",
      value: "10010W"
    }
  ],
  active: true,
  name: [
    {
      id: "efdb246f-4142-4c12-a27a-9be60b9592e9",
      use: "usual",
      family: "Wilson",
      given: ["John"]
    }
  ],
  gender: "male",
  birthDate: "1972-04-04",
  deceasedBoolean: false,
  address: [
    {
      id: "0c244eae-85c8-4cc9-b168-96b51f864e77",
      use: "home",
      line: ["Address10351"],
      city: "City0351",
      state: "State0351tested",
      postalCode: "60351",
      country: "Country0351"
    }
  ]
};

export const mockPatientConditionResult = {
  resource: {
    resourceType: "Condition",
    id: "92A45BE7A93A4E14A49CB9A51E19C3A4",
    subject: {
      reference: "Patient/D1A903924D4443A7A388778D77D86155"
    },
    clinicalStatus: "active",
    code: {
      coding: {
        system: "http://snomed.info/sct",
        code: "236578006",
        display: "Chronic rejection of renal transplant (disorder)"
      },
      text: "Renal rejection"
    },
    onsetDateTime: "2011-07-30",
    lastUpdated: "2011-08-01",
    lastUpdatedBy: "Dr. Katherine Mwangi",
    lastUpdatedLocation: "Busia, Clinic"
  }
};

export const mockPatientConditionsResult = {
  resourceType: "Bundle",
  id: "fc7b3b324b4f43e4b5d068774ff6ec0b",
  type: "searchset",
  total: 5,
  entry: [
    {
      resource: {
        resourceType: "Condition",
        id: "92A45BE7A93A4E14A49CB9A51E19C3A4",
        subject: {
          reference: "Patient/D1A903924D4443A7A388778D77D86155"
        },
        clinicalStatus: "active",
        code: {
          coding: {
            system: "http://snomed.info/sct",
            code: "236578006",
            display: "Chronic rejection of renal transplant (disorder)"
          },
          text: "Renal rejection"
        },
        onsetDateTime: "2011-07-30"
      }
    },
    {
      resource: {
        resourceType: "Condition",
        id: "67F0026602084CE9BB6DB16A2180B2C5",
        subject: {
          reference: "Patient/D1A903924D4443A7A388778D77D86155"
        },
        clinicalStatus: "resolved",
        code: {
          coding: {
            system: "http://snomed.info/sct",
            code: "238131007",
            display: "Overweight (finding)"
          },
          text: "Overweight"
        },
        onsetDateTime: "2012-09-31"
      }
    },
    {
      resource: {
        resourceType: "Condition",
        id: "A6460892920047379863DD639D5400B2",
        subject: {
          reference: "Patient/D1A903924D4443A7A388778D77D86155"
        },
        clinicalStatus: "active",
        code: {
          coding: {
            system: "http://snomed.info/sct",
            code: "386661006",
            display: "Fever (finding)"
          },
          text: "Fever"
        },
        onsetDateTime: "2015-06-22"
      }
    },
    {
      resource: {
        resourceType: "Condition",
        id: "26EFFA98F55D48B38687B3920285BE15",
        subject: {
          reference: "Patient/D1A903924D4443A7A388778D77D86155"
        },
        clinicalStatus: "active",
        code: {
          coding: {
            system: "http://snomed.info/sct",
            code: "59621000",
            display: "Essential hypertension (disorder)"
          },
          text: "Hypertension"
        },
        onsetDateTime: "2011-08-05"
      }
    }
  ]
};
