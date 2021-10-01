import { Diagnosis, ObsData } from '../types';

const VISIT_DIAGNOSIS_CONCEPT: string = '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const DIAGNOSIS_CERTAINTY_CONCEPT: string = '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const DIAGNOSIS_ORDER_CONCEPT: string = '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const CONFIRMED_DIAGNOSIS_CONCEPT: string = '159392AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const PRESUMED_DIAGNOSIS_CONCEPT: string = '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const PRIMARY_DIAGNOSIS_ORDER_CONCEPT: string = '159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const SECONDARY_DIAGNOSIS_ORDER_CONCEPT: string = '159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const PROBLEM_LIST_CONCEPT: string = '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export function convertToObsPayload(diagnosisArray: Array<Diagnosis>): Array<ObsData> {
  return diagnosisArray.map((diagnosis) => {
    if (diagnosis.confirmed === true && diagnosis.primary === true) {
      // confirmed and primary diagnosis
      return {
        concept: VISIT_DIAGNOSIS_CONCEPT,
        groupMembers: [
          {
            concept: DIAGNOSIS_CERTAINTY_CONCEPT,
            value: CONFIRMED_DIAGNOSIS_CONCEPT,
          },
          {
            concept: DIAGNOSIS_ORDER_CONCEPT,
            value: PRIMARY_DIAGNOSIS_ORDER_CONCEPT,
          },
          {
            concept: PROBLEM_LIST_CONCEPT,
            value: diagnosis.concept.uuid,
          },
        ],
      };
    } else if (diagnosis.confirmed === true && diagnosis.primary === false) {
      // confirmed and secondary diagnosis
      return {
        concept: VISIT_DIAGNOSIS_CONCEPT,
        groupMembers: [
          {
            concept: DIAGNOSIS_CERTAINTY_CONCEPT,
            value: CONFIRMED_DIAGNOSIS_CONCEPT,
          },
          {
            concept: DIAGNOSIS_ORDER_CONCEPT,
            value: SECONDARY_DIAGNOSIS_ORDER_CONCEPT,
          },
          {
            concept: PROBLEM_LIST_CONCEPT,
            value: diagnosis.concept.uuid,
          },
        ],
      };
    } else if (diagnosis.confirmed === false && diagnosis.primary === true) {
      // presumed and primary diagnosis
      return {
        concept: VISIT_DIAGNOSIS_CONCEPT,
        groupMembers: [
          {
            concept: DIAGNOSIS_CERTAINTY_CONCEPT,
            value: PRESUMED_DIAGNOSIS_CONCEPT,
          },
          {
            concept: DIAGNOSIS_ORDER_CONCEPT,
            value: PRIMARY_DIAGNOSIS_ORDER_CONCEPT,
          },
          {
            concept: PROBLEM_LIST_CONCEPT,
            value: diagnosis.concept.uuid,
          },
        ],
      };
    } else if (diagnosis.confirmed === false && diagnosis.primary === false) {
      // presumed and secondary diagnosis
      return {
        concept: VISIT_DIAGNOSIS_CONCEPT,
        groupMembers: [
          {
            concept: DIAGNOSIS_CERTAINTY_CONCEPT,
            value: PRESUMED_DIAGNOSIS_CONCEPT,
          },
          {
            concept: DIAGNOSIS_ORDER_CONCEPT,
            value: SECONDARY_DIAGNOSIS_ORDER_CONCEPT,
          },
          {
            concept: PROBLEM_LIST_CONCEPT,
            value: diagnosis.concept.uuid,
          },
        ],
      };
    }
  });
}
