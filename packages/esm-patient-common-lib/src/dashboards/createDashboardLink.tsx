import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardExtension } from '@openmrs/esm-styleguide';
import { type DashboardLinkConfig } from '../types';

export const createDashboardLink = (db: DashboardLinkConfig) => {
  return ({ basePath }: { basePath: string }) => {
    return (
      <BrowserRouter>
        <DashboardExtension basePath={basePath} title={db.title} path={db.path} icon={db.icon} />
      </BrowserRouter>
    );
  };
};
