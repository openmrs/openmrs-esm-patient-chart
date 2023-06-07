import React from 'react';
import { Type, useConfig } from '@openmrs/esm-framework';
import { BrowserRouter } from 'react-router-dom';
import { DashboardExtension } from '@openmrs/esm-patient-common-lib';

export const genericDashboardConfigSchema = {
  title: {
    _description: 'The display string for this dashboard',
    _type: Type.String,
  },
  path: {
    _description: 'The URL fragment this link points to',
    _type: Type.String,
  },
  slot: {
    _description: 'The slot that this dashbaord config renders',
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
  path: string;
  title: string;
  /** This gets used by the patient chart when it renders the dashboard itself. */
  slot: string;
}

interface GenericDashboardProps {
  basePath: string;
}

export default function GenericDashboard({ basePath }: GenericDashboardProps) {
  const config = useConfig<GenericDashboardConfig>();
  return (
    <BrowserRouter>
      <DashboardExtension path={config.path} title={config.title} basePath={basePath} />
    </BrowserRouter>
  );
}
