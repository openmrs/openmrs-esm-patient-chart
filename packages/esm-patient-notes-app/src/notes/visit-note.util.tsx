const VISIT_DIAGNOSIS_CONCEPT: string = "159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const DIAGNOSIS_CERTAINTY_CONCEPT: string =
  "159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const DIAGNOSIS_ORDER_CONCEPT: string = "159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const CONFIRMED_DIAGNOSIS_CONCEPT: string =
  "159392AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const PRESUMED_DIAGNOSIS_CONCEPT: string =
  "159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const PRIMARY_DIAGNOSIS_ORDER_CONCEPT: string =
  "159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const SECONDARY_DIAGNOSIS_ORDER_CONCEPT: string =
  "159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const PROBLEM_LIST_CONCEPT: string = "1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export interface obs {
  concept: string;
  value?: string | any;
  groubMembers?: [{ concept: string; value?: string | any }];
}

export interface Diagnosis {
  concept: any;
  conceptReferenceTermCode: string;
  primary: boolean;
  confirmed: boolean;
}

export interface VisitNotePayload {
  encounterDatetime: Date; // date and time the encounter was created (ISO8601 Long) (REQUIRED)
  encounterType: string; // uuid of the encounter type - initial visit, return visit etc. (REQUIRED)
  patient: string; // the patient to whom the encounter applies
  location: string; // the location at which the encounter occurred (REQUIRED)
  encounterProviders: Array<{ encounterRole: string; provider: string }>; // array of providers and their role within the encounter. At least 1 provider is required
  obs: Array<any>; // array of observations and values for the encounter
  form: string; // target form uuid to be filled for the encounter
  orders?: Array<any>; // list of orders created during the encounter
  visit?: string; // when creating an encounter for a specific visit, this specifies the visit
}

export function convertToObsPayLoad(diagnosisArray: Array<any>): Array<obs> {
  return diagnosisArray.map(diagnosis => {
    if (diagnosis.confirmed === true && diagnosis.primary === true) {
      // confirmed and primary diagnosis
      return {
        concept: VISIT_DIAGNOSIS_CONCEPT,
        groupMembers: [
          {
            concept: DIAGNOSIS_CERTAINTY_CONCEPT,
            value: CONFIRMED_DIAGNOSIS_CONCEPT
          },
          {
            concept: DIAGNOSIS_ORDER_CONCEPT,
            value: PRIMARY_DIAGNOSIS_ORDER_CONCEPT
          },
          {
            concept: PROBLEM_LIST_CONCEPT,
            value: diagnosis.concept.uuid
          }
        ]
      };
    } else if (diagnosis.confirmed === true && diagnosis.primary === false) {
      // confirmed and secondary diagnosis
      return {
        concept: VISIT_DIAGNOSIS_CONCEPT,
        groupMembers: [
          {
            concept: DIAGNOSIS_CERTAINTY_CONCEPT,
            value: CONFIRMED_DIAGNOSIS_CONCEPT
          },
          {
            concept: DIAGNOSIS_ORDER_CONCEPT,
            value: SECONDARY_DIAGNOSIS_ORDER_CONCEPT
          },
          {
            concept: PROBLEM_LIST_CONCEPT,
            value: diagnosis.concept.uuid
          }
        ]
      };
    } else if (diagnosis.confirmed === false && diagnosis.primary === true) {
      // presumed and primary diagnosis
      return {
        concept: VISIT_DIAGNOSIS_CONCEPT,
        groupMembers: [
          {
            concept: DIAGNOSIS_CERTAINTY_CONCEPT,
            value: PRESUMED_DIAGNOSIS_CONCEPT
          },
          {
            concept: DIAGNOSIS_ORDER_CONCEPT,
            value: PRIMARY_DIAGNOSIS_ORDER_CONCEPT
          },
          {
            concept: PROBLEM_LIST_CONCEPT,
            value: diagnosis.concept.uuid
          }
        ]
      };
    } else if (diagnosis.confirmed === false && diagnosis.primary === false) {
      // presumed and secondary diagnosis
      return {
        concept: VISIT_DIAGNOSIS_CONCEPT,
        groupMembers: [
          {
            concept: DIAGNOSIS_CERTAINTY_CONCEPT,
            value: PRESUMED_DIAGNOSIS_CONCEPT
          },
          {
            concept: DIAGNOSIS_ORDER_CONCEPT,
            value: SECONDARY_DIAGNOSIS_ORDER_CONCEPT
          },
          {
            concept: PROBLEM_LIST_CONCEPT,
            value: diagnosis.concept.uuid
          }
        ]
      };
    }
  });
}
