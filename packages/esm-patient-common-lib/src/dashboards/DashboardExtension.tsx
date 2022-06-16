import React, { useMemo } from 'react';
import { last } from 'lodash';
import { useLocation } from 'react-router-dom';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from './dashboardextension.scss';

export interface DashboardExtensionProps {
  title: string;
  basePath: string;
}

export const DashboardExtension = ({ title, basePath, ...props }: DashboardExtensionProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navLink = useMemo(() => decodeURIComponent(last(currentPath.split('/'))), [location.pathname]);

  const activeClassName = title === navLink ? styles.activeNavItem : styles.notActive;

  return (
    <div key={title} className={activeClassName}>
      <ConfigurableLink to={`${basePath}/${encodeURIComponent(title)}`} className="bx--side-nav__link">
        {title}
      </ConfigurableLink>
    </div>
  );
};
