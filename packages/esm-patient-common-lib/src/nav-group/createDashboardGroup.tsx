import React from 'react';
import { DashboardGroupExtension } from './DashboardGroupExtension';

export const createDashboardGroup = ({ title, slotName }: { title: string; slotName: string }) => {
  const DashboardGroup = ({ basePath }: { basePath: string }) => {
    return <DashboardGroupExtension title={title} slotName={slotName} basePath={basePath} />;
  };
  return DashboardGroup;
};
