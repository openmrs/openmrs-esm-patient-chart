import { DiagnosisTags, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import type { LightweightVisit } from '../visits-widget/visit.resource';

interface Props {
  visit: Visit | LightweightVisit;
  patient: fhir.Patient;
}

/**
 * Renders diagnosis tags for a visit.
 * Supports both:
 * - Lightweight API response: diagnoses at visit level (visit.diagnoses)
 * - Full API response: diagnoses nested inside encounters (visit.encounters[].diagnoses)
 */
const VisitDiagnosisCell: React.FC<Props> = ({ visit }) => {
  const diagnoses = getDiagnosesFromVisit(visit);
  return <DiagnosisTags diagnoses={diagnoses} />;
};

function getDiagnosesFromVisit(visit: Visit | LightweightVisit) {
  // Lightweight API: diagnoses directly on the visit object
  if ('diagnoses' in visit && Array.isArray(visit.diagnoses) && visit.diagnoses.length > 0) {
    return visit.diagnoses.filter((diagnosis) => !diagnosis.voided).sort((a, b) => a.rank - b.rank);
  }

  // Full API: diagnoses nested inside encounters
  if ('encounters' in visit && Array.isArray(visit.encounters)) {
    return visit.encounters
      .flatMap((encounter) => encounter.diagnoses)
      .filter((diagnosis) => !diagnosis.voided)
      .sort((a, b) => a.rank - b.rank);
  }

  return [];
}

export default VisitDiagnosisCell;
