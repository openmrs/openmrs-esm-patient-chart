import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { DashboardLinkConfig } from './types';

export const createDashboardLink = (db: DashboardLinkConfig) => {
  const DashboardLink = ({ basePath }: { basePath: string }) => {
    return (
      <div key={db.name}>
        <ConfigurableLink to={`${basePath}/${db.name}`} className="bx--side-nav__link">
          {db.title}
        </ConfigurableLink>
      </div>
    );
  };
  return DashboardLink;
};
