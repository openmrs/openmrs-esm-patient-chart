import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { DashboardGroupExtension } from '@openmrs/esm-patient-common-lib';

interface GenericNavGroupProps {
  basePath: string;
}

export default function GenericNavGroup({ basePath }: GenericNavGroupProps) {
  const config = useConfig();
  return (
    <DashboardGroupExtension title={config.navGroup.title} slotName={config.navGroup.slotName} basePath={basePath} />
  );
}
