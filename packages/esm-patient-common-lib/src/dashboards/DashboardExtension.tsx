import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface DashboardExtensionProps {
  name: string;
  title: string;
  basePath: string;
}

export const DashboardExtension = ({ name, title, basePath }: DashboardExtensionProps) => {
  return (
    <div key={name}>
      <ConfigurableLink to={`${basePath}/${name}`} className="bx--side-nav__link">
        {title}
      </ConfigurableLink>
    </div>
  );
};
