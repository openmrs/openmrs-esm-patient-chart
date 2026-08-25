import { DiagnosisTags, type Diagnosis, type Visit } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { dedupeDiagnoses } from '../dedupe-diagnoses';

interface Props {
  visit: Visit;
  patient: fhir.Patient;
  diagnoses?: Array<Diagnosis>;
}

const VisitDiagnosisCell: React.FC<Props> = ({ visit, diagnoses }) => {
  const resolvedDiagnoses = useMemo(() => {
    // If EMRAPI diagnoses are provided, use them directly
    if (diagnoses && diagnoses.length > 0) {
      return diagnoses;
    }
    // Fallback: extract from visit encounters
    const encounterDiagnoses =
      visit?.encounters?.flatMap((enc) => enc.diagnoses ?? []).filter((d) => !d.voided) ?? [];
    return dedupeDiagnoses(encounterDiagnoses);
  }, [diagnoses, visit?.encounters]);

  return <DiagnosisTags diagnoses={resolvedDiagnoses} />;
};

export default VisitDiagnosisCell;
