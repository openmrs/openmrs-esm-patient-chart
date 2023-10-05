import React from 'react';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import styles from './action-menu.scss';

interface ActionMenuInterface {
  open: boolean;
}

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const layout = useLayoutType();

  return (
    <aside className={styles.sideRail}>
      <div className={styles.container}>
        <ExtensionSlot className={styles.chartExtensions} name={'action-menu-chart-items-slot'} />
        {layout === 'small-desktop' || layout === 'large-desktop' ? <div className={styles.divider}></div> : null}
        <ExtensionSlot className={styles.nonChartExtensions} name={'action-menu-non-chart-items-slot'} />
      </div>
    </aside>
  );
};

export default ActionMenu;
