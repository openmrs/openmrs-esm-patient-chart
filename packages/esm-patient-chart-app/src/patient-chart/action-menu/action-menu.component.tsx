import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { HeaderPanel } from 'carbon-components-react';
import styles from './action-menu.scss';

interface ActionMenuInterface {
  open: boolean;
}

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  return (
    <>
      <aside className={styles.sideRail}>
        <ExtensionSlot className={styles.extensionStyles} extensionSlotName={'action-menu-items-slot'} />
      </aside>
      <HeaderPanel className={styles.actionPanel} expanded={open} aria-label="Drawer">
        <ExtensionSlot extensionSlotName={'drawer-slot'} />
      </HeaderPanel>
    </>
  );
};

export default ActionMenu;
