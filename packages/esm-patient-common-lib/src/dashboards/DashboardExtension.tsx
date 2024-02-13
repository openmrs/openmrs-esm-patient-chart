import React, { useMemo } from 'react';
import classNames from 'classnames';
import last from 'lodash-es/last';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';

export interface DashboardExtensionProps {
  path: string;
  title: string;
  basePath: string;
  moduleName?: string;
  renderIcon?: React.ComponentType<any>;
}

export const DashboardExtension = ({
  path,
  title,
  basePath,
  moduleName = '@openmrs/esm-patient-chart-app',
  renderIcon,
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
        {renderIcon && (
          <Button
            hasIconOnly
            aria-label="Configurable link icon"
            size="sm"
            kind="ghost"
            renderIcon={renderIcon}
            iconDescription="Link"
          />
        )}
        {t(title)}
      </ConfigurableLink>
    </div>
  );
};
