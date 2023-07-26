import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import last from 'lodash-es/last';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

export interface DashboardExtensionProps {
  path: string;
  title: string;
  basePath: string;
  moduleName?: string;
}

export const DashboardExtension = ({
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
        to={`${basePath}/${encodeURIComponent(path)}`}
        className={`cds--side-nav__link ${path === navLink && 'active-left-nav-link'}`}
      >
        {t(title)}
      </ConfigurableLink>
    </div>
  );
};
