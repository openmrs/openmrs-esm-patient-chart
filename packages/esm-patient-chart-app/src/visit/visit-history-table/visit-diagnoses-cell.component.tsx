import { type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { dedupeDiagnoses } from '../dedupe-diagnoses';
import VisitDiagnosisTags from '../visit-diagnosis-tags.component';

interface Props {
  visit: Visit;
  patient: fhir.Patient;
}

const VisitDiagnosisCell: React.FC<Props> = ({ visit }) => {
  const diagnoses = dedupeDiagnoses(
    visit.encounters.flatMap((encounter) => encounter.diagnoses).filter((diagnosis) => !diagnosis.voided),
  );

  return <VisitDiagnosisTags diagnoses={diagnoses} />;
};

export default VisitDiagnosisCell;
