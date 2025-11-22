import { type Visit } from '@openmrs/esm-framework';
import React from 'react';

interface Props {
  visit: Visit;
  patient: fhir.Patient;
}

const VisitTypeCell: React.FC<Props> = ({ visit }) => {
  const { visitType } = visit;

  return <>{visitType.display}</>;
};

export default VisitTypeCell;
