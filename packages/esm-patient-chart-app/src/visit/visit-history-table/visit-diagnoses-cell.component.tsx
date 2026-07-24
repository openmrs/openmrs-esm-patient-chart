import { type Diagnosis, DiagnosisTags, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { dedupeDiagnoses } from '../dedupe-diagnoses';

interface Props {
  visit: Visit;
  emrapiDiagnoses?: Array<Diagnosis>;
  patient: fhir.Patient;
}

const VisitDiagnosisCell: React.FC<Props> = ({ visit, emrapiDiagnoses }) => {
  const diagnoses = getDiagnosesFromVisit(visit, emrapiDiagnoses);
  return <DiagnosisTags diagnoses={diagnoses} />;
};

function getDiagnosesFromVisit(visit: Visit, emrapiDiagnoses?: Array<Diagnosis>) {
  if (emrapiDiagnoses && emrapiDiagnoses.length > 0) {
    return dedupeDiagnoses(emrapiDiagnoses.filter((diagnosis) => !diagnosis.voided));
  }

  if (visit.encounters) {
    return dedupeDiagnoses(
      visit.encounters.flatMap((encounter) => encounter.diagnoses ?? []).filter((diagnosis) => !diagnosis.voided),
    );
  }

  return [];
}

export default VisitDiagnosisCell;
