import React from 'react';
import { Type, useConfig } from '@openmrs/esm-framework';
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
  return <DashboardExtension title={config.title} basePath={basePath} />;
}
