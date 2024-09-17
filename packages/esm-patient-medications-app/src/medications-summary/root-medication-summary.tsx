import React from 'react';
import MedicationsSummary from './medications-summary.component';

export interface RootMedicationSummaryProps {
  patient: fhir.Patient;
}

export default function RootMedicationSummary({ patient }: RootMedicationSummaryProps) {
  return (
    <div>
      <MedicationsSummary patient={patient} />
    </div>
  );
}
