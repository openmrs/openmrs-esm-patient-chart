import React from 'react';
import { Type, useConfig } from '@openmrs/esm-framework';
import { BrowserRouter } from 'react-router-dom';
import { DashboardExtension } from '@openmrs/esm-patient-common-lib';

export const genericDashboardConfigSchema = {
  title: {
    _default: 'New Dashboard',
    _type: Type.String,
  },
  slot: {
    _default: 'new-dashboard-slot',
    _type: Type.String,
  },
  columns: {
    _default: 1,
    _type: Type.Number,
    _description:
      'The number of columns that widgets in the dashboard ' +
      "can use to display themselves in. Note that '2' will not " +
      'necessarily result in a two-column layout—rather that widgets ' +
      'will be able to occupy either one or both of those columns.',
  },
};

export interface GenericDashboardConfig {
  title: string;
  /** This gets used by the patient chart when it renders the dashboard itself. */
  slot: string;
}

interface GenericDashboardProps {
  basePath: string;
}

export default function GenericDashboard({ basePath }: GenericDashboardProps) {
  const config = useConfig() as GenericDashboardConfig;
  return (
    <BrowserRouter>
      <DashboardExtension title={config.title} basePath={basePath} />
    </BrowserRouter>
  );
}
