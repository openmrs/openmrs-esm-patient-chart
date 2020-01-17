import { openmrsFetch } from "@openmrs/esm-api";
import { of } from "rxjs";

export function performPatientConditionSearch(
  patientIdentifier: string,
  abortController: AbortController
) {
  return Promise.resolve(mockPatientConditionSearchResponse);
}

const mockPatientConditionSearchResponse = {
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
    },
    {
      resource: {
        resourceType: "Condition",
        id: "27EFFA98F55D48B38687B3920285BE15",
        subject: {
          reference: "Patient/D1A903924D4443A7A388778D77D86155"
        },
        clinicalStatus: "inactive",
        code: {
          coding: {
            system: "http://snomed.info/sct",
            code: "59621000",
            display: "Essential hypertension (disorder)"
          },
          text: "Shortness of breath"
        },
        onsetDateTime: "2011-08-05"
      }
    }
  ]
};
