import { Diagnosis, ObsPayload } from '../types';

const VISIT_DIAGNOSIS_CONCEPT = '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const DIAGNOSIS_CERTAINTY_CONCEPT = '159394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const DIAGNOSIS_ORDER_CONCEPT = '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const CONFIRMED_DIAGNOSIS_CONCEPT = '159392AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const PRESUMED_DIAGNOSIS_CONCEPT = '159393AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const PRIMARY_DIAGNOSIS_ORDER_CONCEPT = '159943AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const SECONDARY_DIAGNOSIS_ORDER_CONCEPT = '159944AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const PROBLEM_LIST_CONCEPT = '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export function convertToObsPayload(diagnosisArray: Array<Diagnosis>): Array<ObsPayload> {
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
            value: diagnosis.uuid,
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
            value: diagnosis.uuid,
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
            value: diagnosis.uuid,
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
            value: diagnosis.uuid,
          },
        ],
      };
    }
  });
}
