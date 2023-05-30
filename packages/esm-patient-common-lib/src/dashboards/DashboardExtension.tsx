import React, { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import last from 'lodash-es/last';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface DashboardExtensionProps {
  title: string | (() => string) | (() => Promise<string>);
  basePath: string;
}

export const DashboardExtension = ({ title, basePath }: DashboardExtensionProps) => {
  const location = useLocation();
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);
  const [resolvedTitle, setResolvedTitle] = useState<string>('');

  useEffect(() => {
    if (typeof title === 'function') {
      Promise.resolve(title()).then((resolvedValue) => {
        setResolvedTitle(resolvedValue);
      });
    } else {
      setResolvedTitle(title);
    }
  }, [title]);

  return (
    <div key={resolvedTitle}>
      <ConfigurableLink
        to={`${basePath}/${encodeURIComponent(resolvedTitle)}`}
        className={`cds--side-nav__link ${resolvedTitle === navLink && 'active-left-nav-link'}`}
      >
        {resolvedTitle}
      </ConfigurableLink>
    </div>
  );
};
