import React from 'react';
import styles from './side-menu.scss';
import { SideNav, SideNavProps } from 'carbon-components-react';
import { useLayoutType } from '@openmrs/esm-framework';
import { isDesktop } from '../utils';
import PatientChartNavMenu from './nav.component';

interface SideMenuPanelProps extends SideNavProps {}

const SideMenuPanel: React.FC<SideMenuPanelProps> = () => {
  const layout = useLayoutType();

  return (
    isDesktop(layout) && (
      <SideNav expanded aria-label="Menu" className={styles.link}>
        <PatientChartNavMenu />
      </SideNav>
    )
  );
};

export default SideMenuPanel;
