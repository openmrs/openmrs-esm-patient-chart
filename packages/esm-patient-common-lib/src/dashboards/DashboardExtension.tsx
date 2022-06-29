import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { last } from 'lodash';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from './dashboardextension.scss';

export interface DashboardExtensionProps {
  title: string;
  basePath: string;
}

export const DashboardExtension = ({ title, basePath }: DashboardExtensionProps) => {
  const location = useLocation<Location>() || window.location;
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);

  const activeClassName = title === navLink ? 'active-left-nav-link' : 'non-active';

  return (
    <div key={title} className={activeClassName}>
      <ConfigurableLink to={`${basePath}/${encodeURIComponent(title)}`} className={'bx--side-nav__link ' + styles.link}>
        {title}
      </ConfigurableLink>
    </div>
  );
};
