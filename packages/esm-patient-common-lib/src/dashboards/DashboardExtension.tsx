import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import last from 'lodash-es/last';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface DashboardExtensionProps {
  title: string;
  basePath: string;
}

export const DashboardExtension = ({ title, basePath }: DashboardExtensionProps) => {
  const location = useLocation();
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);

  return (
    <div key={title} className={title === navLink && 'active-left-nav-link'}>
      <ConfigurableLink to={`${basePath}/${encodeURIComponent(title)}`} className={'cds--side-nav__link'}>
        {title}
      </ConfigurableLink>
    </div>
  );
};
