import React from 'react';
import { Type, useConfig } from '@openmrs/esm-framework';
import { DashboardGroupExtension } from '@openmrs/esm-patient-common-lib';

export const genericNavGroupConfigSchema = {
  title: {
    _type: Type.String,
    _description: 'The title of the nav group.',
    _default: 'My Group',
  },
  slotName: {
    _type: Type.String,
    _description: 'The name of the slot to create, which links can be added to.',
    _default: 'my-group-nav-slot',
  },
};

export interface GenericNavGroupConfig {
  title: string;
  slotName: string;
}

interface GenericNavGroupProps {
  basePath: string;
}

export default function GenericNavGroup({ basePath }: GenericNavGroupProps) {
  const config = useConfig<GenericNavGroupConfig>();
  return <DashboardGroupExtension title={config.title} slotName={config.slotName} basePath={basePath} />;
}
