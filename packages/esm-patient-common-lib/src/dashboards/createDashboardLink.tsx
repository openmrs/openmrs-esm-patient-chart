import React from 'react';
import { DashboardLinkConfig } from '../types';
import { DashboardExtension } from './DashboardExtension';

export const createDashboardLink = (db: DashboardLinkConfig) => {
  const Dashboard = ({ basePath }: { basePath: string }) => {
    return <DashboardExtension name={db.name} title={db.title} basePath={basePath} />;
  };
  return Dashboard;
};
