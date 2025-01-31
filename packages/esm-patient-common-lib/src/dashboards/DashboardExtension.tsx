import React, { useMemo } from 'react';
import classNames from 'classnames';
import last from 'lodash-es/last';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ConfigurableLink, MaybeIcon } from '@openmrs/esm-framework';
import { setupIcons } from '@openmrs/esm-styleguide/src/icons/icon-registration';
import styles from './dashboard-extension.scss';

export interface DashboardExtensionProps {
  path: string;
  title: string;
  basePath: string;
  icon: string;
  moduleName?: string;
}

export const DashboardExtension = ({
  path,
  title,
  basePath,
  icon,
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
        <span className={styles.menu}>
          <MaybeIcon icon={icon} className={styles.icon} />
          <span>{t(title)}</span>
        </span>
      </ConfigurableLink>
    </div>
  );
};
