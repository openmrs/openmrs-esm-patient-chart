import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { type DashboardLinkConfig } from '../types';
import { DashboardExtension } from './DashboardExtension';

export const createDashboardLink = (db: DashboardLinkConfig) => {
  return ({ basePath }: { basePath: string }) => {
    return (
      <BrowserRouter>
        <DashboardExtension
          icon={db.icon}
          basePath={basePath}
          title={db.title}
          path={db.path}
          moduleName={db.moduleName}
        />
      </BrowserRouter>
    );
  };
};
