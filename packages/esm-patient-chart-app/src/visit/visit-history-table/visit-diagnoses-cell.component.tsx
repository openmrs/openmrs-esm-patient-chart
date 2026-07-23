import { DiagnosisTags, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { dedupeDiagnoses } from '../dedupe-diagnoses';
import type { LightweightVisit } from '../visits-widget/visit.resource';

interface Props {
  visit: Visit | LightweightVisit;
  patient: fhir.Patient;
}

const VisitDiagnosisCell: React.FC<Props> = ({ visit }) => {
  const diagnoses = getDiagnosesFromVisit(visit);
  return <DiagnosisTags diagnoses={diagnoses} />;
};

function getDiagnosesFromVisit(visit: Visit | LightweightVisit) {
  if ('diagnoses' in visit && Array.isArray(visit.diagnoses) && visit.diagnoses.length > 0) {
    return dedupeDiagnoses(visit.diagnoses.filter((d) => !d.voided));
  }

  if ('encounters' in visit && Array.isArray(visit.encounters)) {
    return dedupeDiagnoses(
      visit.encounters.flatMap((encounter) => encounter.diagnoses ?? []).filter((d) => !d.voided),
    );
  }

  return [];
}

export default VisitDiagnosisCell;
