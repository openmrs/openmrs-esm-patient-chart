import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';

interface OfflineToolsNavLinkProps {
  page?: string;
  title: string;
}

export default function OfflineToolsNavLink({ page, title }: OfflineToolsNavLinkProps) {
  return (
    <div key={page}>
      <ConfigurableLink
        to={'${openmrsSpaBase}' + '/offline-tools' + (page ? `/${page}` : '')}
        className="cds--side-nav__link"
      >
        {title}
      </ConfigurableLink>
    </div>
  );
}
