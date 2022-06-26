import React from 'react';
import { DashboardLinkConfig } from '../types';
import { DashboardExtension } from './DashboardExtension';

export const createDashboardLink = (db: DashboardLinkConfig) => {
  const Dashboard = ({ basePath, currentPath }: { basePath: string; currentPath: string }) => {
    return <DashboardExtension title={db.title} basePath={basePath} currentPath={currentPath} />;
  };
  return Dashboard;
};
