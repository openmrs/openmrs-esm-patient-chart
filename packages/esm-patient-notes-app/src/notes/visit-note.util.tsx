import { Diagnosis, FormatDiagnosis } from '../types';

export function formatDiagnosisPayload(diagnosisArray: Array<Diagnosis>): Array<FormatDiagnosis> {
  return diagnosisArray.map((diagnosis) => {
    if (diagnosis.confirmed === true && diagnosis.primary === true) {
      return {
        diagnosis: {
          coded: diagnosis.uuid,
        },
        certainty: 'CONFIRMED',
        rank: 1,
      };
    } else if (diagnosis.confirmed === true && diagnosis.primary === false) {
      return {
        diagnosis: {
          coded: diagnosis.uuid,
        },
        certainty: 'CONFIRMED',
        rank: 2,
      };
    } else if (diagnosis.confirmed === false && diagnosis.primary === true) {
      return {
        diagnosis: {
          coded: diagnosis.uuid,
        },
        certainty: 'PROVISIONAL',
        rank: 1,
      };
    } else if (diagnosis.confirmed === false && diagnosis.primary === false) {
      return {
        diagnosis: {
          coded: diagnosis.uuid,
        },
        certainty: 'PROVISIONAL',
        rank: 2,
      };
    }
  });
}
