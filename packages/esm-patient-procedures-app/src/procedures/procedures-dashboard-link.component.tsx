import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { Scalpel } from '@carbon/react/icons';

interface ProceduresDashboardLinkProps {
  basePath: string;
}

const ProceduresDashboardLink: React.FC<ProceduresDashboardLinkProps> = ({ basePath }) => {
  return (
    <ConfigurableLink to={`${basePath}/procedures`} className="cds--side-nav__link">
      <Scalpel className="cds--side-nav__icon" size={16} />
      <span className="cds--side-nav__link-text">Procedures</span>
    </ConfigurableLink>
  );
};

export default ProceduresDashboardLink;
