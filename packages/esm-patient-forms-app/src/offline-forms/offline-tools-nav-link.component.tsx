import { ConfigurableLink } from '@openmrs/esm-framework';
import React from 'react';

interface OfflineToolsNavLinkProps {
  page?: string;
  title: string;
}

export default function OfflineToolsNavLink({ page, title }: OfflineToolsNavLinkProps) {
  return (
    <div key={page}>
      <ConfigurableLink
        to={'${openmrsSpaBase}' + '/offline-tools' + (page ? `/${page}` : '')}
        className="bx--side-nav__link"
      >
        {title}
      </ConfigurableLink>
    </div>
  );
}
