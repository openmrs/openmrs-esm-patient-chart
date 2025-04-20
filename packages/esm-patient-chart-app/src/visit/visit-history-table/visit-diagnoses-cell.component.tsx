import { DiagnosisTags, type Visit } from '@openmrs/esm-framework';
import React from 'react';

interface Props {
  visit: Visit;
}

const VisitDiagnosisCell: React.FC<Props> = ({ visit }) => {
  const diagnoses = visit.encounters.flatMap((encounter) => encounter.diagnoses).sort((a, b) => a.rank - b.rank);

  return <DiagnosisTags diagnoses={diagnoses} />;
};

export default VisitDiagnosisCell;
