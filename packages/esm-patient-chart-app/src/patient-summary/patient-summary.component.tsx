import React from 'react';
//import { SummaryCard } from "@openmrs/esm-patient-common-lib";
import { useConfig } from '@openmrs/esm-framework';
import { SummaryCard } from '../encounter-tile/summary-card.component';

export function PatientSummaryCardContainer() {
  const config = useConfig();
  const testColumns = [
    {
      header: 'Age',
      value: '34',
      summary: 'No country for old men',
    },
    {
      header: 'Marital Status',
      value: 'Married',
    },
    {
      header: 'Number of Children',
      value: '10',
    },
    {
      header: 'DOB',
      value: '10/04/1990',
    },
  ];

  return <SummaryCard headerTitle="Test" columns={testColumns} />;
}
