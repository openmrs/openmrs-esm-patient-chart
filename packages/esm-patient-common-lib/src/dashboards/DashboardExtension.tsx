import React, { useMemo } from 'react';
import classNames from 'classnames';
import last from 'lodash-es/last';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { Activity } from '@carbon/react/icons';

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

  const renderIcon = title === 'Vitals & Biometrics' ? <Activity style={{ marginRight: '8px' }} /> : null;

  return (
    <div key={path} style={{ display: 'flex', alignItems: 'center' }}>
      <ConfigurableLink
        className={classNames('cds--side-nav__link', { 'active-left-nav-link': path === navLink })}
        to={`${basePath}/${encodeURIComponent(path)}`}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {renderIcon}
          <span>{t(title)}</span>
        </span>
      </ConfigurableLink>
    </div>
  );
};
