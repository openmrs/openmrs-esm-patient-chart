import React from 'react';
import MedicationsSummary from './medications-summary.component';

export interface RootMedicationSummaryProps {
  patientUuid: string;
}

export default function RootMedicationSummary({ patientUuid }: RootMedicationSummaryProps) {
  return (
    <div>
      <MedicationsSummary patientUuid={patientUuid} />
    </div>
  );
}
