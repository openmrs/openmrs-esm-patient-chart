import React from 'react';
import styles from './visit-header-link.scss';
import { ConfigurableLink, interpolateUrl, useConfig } from '@openmrs/esm-framework';

interface VisitHeaderLinkProps {}

const VisitHeaderLink: React.FC<VisitHeaderLinkProps> = () => {
  const { logo } = useConfig();
  return (
    <div className={styles.linkContainer}>
      <ConfigurableLink className={styles.navLogo} to="${openmrsSpaBase}/home">
        {logo?.src ? (
          <img className={styles.logo} src={interpolateUrl(logo.src)} alt={logo.alt} width={110} height={40} />
        ) : logo?.name ? (
          logo.name
        ) : (
          <svg role="img" width={110} height={40}>
            <use xlinkHref="#omrs-logo-white"></use>
          </svg>
        )}
      </ConfigurableLink>
    </div>
  );
};

export default VisitHeaderLink;
