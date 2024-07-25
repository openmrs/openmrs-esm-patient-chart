import React from 'react';
import { Type, useConfig } from '@openmrs/esm-framework';
import { BrowserRouter } from 'react-router-dom';
import { DashboardExtension } from '@openmrs/esm-patient-common-lib';

export const genericDashboardConfigSchema = {
  title: {
    _description: 'The display string for this dashboard',
    _default: '',
    _type: Type.String,
  },
  path: {
    _description: 'The URL fragment this link points to',
    _default: '',
    _type: Type.String,
  },
  slot: {
    _description: 'The slot that this dashboard config renders',
    _default: '',
    _type: Type.String,
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
      <DashboardExtension
        path={config.path}
        title={config.title}
        basePath={basePath}
        moduleName="@openmrs/esm-patient-chart-app"
      />
    </BrowserRouter>
  );
}
