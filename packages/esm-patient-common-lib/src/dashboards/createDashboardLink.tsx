import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardLinkConfig } from '../types';
import { DashboardExtension } from './DashboardExtension';

export const createDashboardLink = (db: DashboardLinkConfig) => {
  return ({ basePath }: { basePath: string }) => {
    return (
      <BrowserRouter>
        <DashboardExtension basePath={basePath} title={db.title} path={db.path} />
      </BrowserRouter>
    );
  };
};
