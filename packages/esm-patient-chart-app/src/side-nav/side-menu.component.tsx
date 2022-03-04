import React from 'react';
import styles from './side-menu.scss';
import { SideNav, SideNavProps } from 'carbon-components-react';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { useNavMenu } from './useNavMenu';
import { isDesktop } from '../utils';

interface SideMenuPanelProps extends SideNavProps {}

const SideMenuPanel: React.FC<SideMenuPanelProps> = () => {
  const layout = useLayoutType();
  useNavMenu();

  return (
    isDesktop(layout) && (
      <SideNav expanded aria-label="Menu" className={styles.link}>
        <ExtensionSlot extensionSlotName="nav-menu-slot" />
      </SideNav>
    )
  );
};

export default SideMenuPanel;
