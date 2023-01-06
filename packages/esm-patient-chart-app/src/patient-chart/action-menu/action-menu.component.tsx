import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './action-menu.scss';

interface ActionMenuInterface {
  patientUuid: string;
}

export const ActionMenu: React.FC<ActionMenuInterface> = ({ patientUuid }) => {
  return (
    <aside className={styles.sideRail}>
      <ExtensionSlot
        className={styles.extensionStyles}
        extensionSlotName={'action-menu-items-slot'}
        state={{ patientUuid }}
      />
    </aside>
  );
};

export default ActionMenu;
