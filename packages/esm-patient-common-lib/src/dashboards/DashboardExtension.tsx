import React, { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import last from 'lodash-es/last';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface DashboardExtensionProps {
  path: string;
  title: string | (() => string | Promise<string>);
  basePath: string;
}

export const DashboardExtension = ({ path, title, basePath }: DashboardExtensionProps) => {
  const location = useLocation();
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);
  const [resolvedTitle, setResolvedTitle] = useState<string | undefined>();

  useEffect(() => {
    if (typeof title === 'function') {
      Promise.resolve(title())
        .then((resolvedValue) => {
          setResolvedTitle(resolvedValue);
        })
        .catch((e: Error) => {
          throw e;
        });
    } else {
      setResolvedTitle(title);
    }
  }, [title]);

  return (
    title &&
    resolvedTitle && (
      <div key={path}>
        <ConfigurableLink
          to={`${basePath}/${encodeURIComponent(path)}`}
          className={`cds--side-nav__link ${path === navLink && 'active-left-nav-link'}`}
        >
          {resolvedTitle}
        </ConfigurableLink>
      </div>
    )
  );
};
