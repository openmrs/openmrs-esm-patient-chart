import { Diagnosis, FormatDiagnosis } from '../types';

export function formatDiagnosisPayload(diagnosisArray: Array<Diagnosis>): Array<FormatDiagnosis> {
  return diagnosisArray.map((diagnosis) => {
    return {
      diagnosis: {
        coded: diagnosis.concept.uuid,
      },
      certainty: diagnosis.confirmed ? 'CONFIRMED' : 'PROVISIONAL',
      rank: diagnosis.primary ? 1 : 2,
    };
  });
}
