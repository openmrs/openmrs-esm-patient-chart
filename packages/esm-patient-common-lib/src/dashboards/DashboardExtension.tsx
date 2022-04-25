import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface DashboardExtensionProps {
  title: string;
  basePath: string;
}

export const DashboardExtension = ({ title, basePath }: DashboardExtensionProps) => {
  return (
    <div key={title}>
      <ConfigurableLink to={`${basePath}/${encodeURIComponent(title)}`} className="bx--side-nav__link">
        {title}
      </ConfigurableLink>
    </div>
  );
};
