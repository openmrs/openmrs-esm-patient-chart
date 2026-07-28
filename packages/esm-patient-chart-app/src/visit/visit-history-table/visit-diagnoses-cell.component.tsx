import { DiagnosisTags, type Diagnosis } from '@openmrs/esm-framework';
import React from 'react';

interface Props {
  visit: any;
  patient: fhir.Patient;
  diagnoses?: Array<Diagnosis>;
}

const VisitDiagnosisCell: React.FC<Props> = ({ diagnoses = [] }) => {
  return <DiagnosisTags diagnoses={diagnoses} />;
};

export default VisitDiagnosisCell;
