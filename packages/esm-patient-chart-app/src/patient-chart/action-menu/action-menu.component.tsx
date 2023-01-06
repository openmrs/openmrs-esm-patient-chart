import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './action-menu.scss';

interface ActionMenuInterface {
  open: boolean;
}

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  return (
    <aside className={styles.sideRail}>
      <ExtensionSlot className={styles.extensionStyles} extensionSlotName={'action-menu-items-slot'} />
    </aside>
  );
};

export default ActionMenu;
