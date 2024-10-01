import React, { useMemo } from 'react';
import classNames from 'classnames';
import last from 'lodash-es/last';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface DashboardExtensionProps {
  path: string;
  title: string;
  basePath: string;
  moduleName?: string;
  icon?: React.ReactElement;
}

export const DashboardExtension = ({
  icon,
  path,
  title,
  basePath,
  moduleName = '@openmrs/esm-patient-chart-app',
}: DashboardExtensionProps) => {
  const { t } = useTranslation(moduleName);
  const location = useLocation();
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);

  return (
    <div key={path}>
      <ConfigurableLink
        className={classNames('cds--side-nav__link', { 'active-left-nav-link': path === navLink })}
        to={`${basePath}/${encodeURIComponent(path)}`}
      >
        {icon} {t(title)}
      </ConfigurableLink>
    </div>
  );
};
