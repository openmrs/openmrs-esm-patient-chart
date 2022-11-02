import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardLinkConfig } from '../types';
import { DashboardExtension } from './DashboardExtension';

export const createDashboardLink = (db: DashboardLinkConfig) => {
  return ({ basePath }: { basePath: string }) => {
    return (
      <BrowserRouter>
        <DashboardExtension title={db.title} basePath={basePath} />
      </BrowserRouter>
    );
  };
};
