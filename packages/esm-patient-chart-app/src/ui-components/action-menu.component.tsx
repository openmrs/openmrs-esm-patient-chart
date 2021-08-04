import React from 'react';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { HeaderPanel } from 'carbon-components-react/es/components/UIShell';
import { isDesktop } from '../utils';
import Edit20 from '@carbon/icons-react/es/edit/20';
import Document20 from '@carbon/icons-react/es/document/20';
import styles from './action-menu.component.scss';
import Button from 'carbon-components-react/es/components/Button';
import { useContextWorkspace } from '../hooks/useContextWindowSize';

interface ActionMenuInterface {
  open: boolean;
}

export const CHARTS_DRAWER_SLOT = 'drawer-slot';
export const CHARTS_ACTION_MENU_ITEMS_SLOT = 'action-menu-items-slot';

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const layout = useLayoutType();
  const { openWindows, updateWindowSize } = useContextWorkspace();

  const menu = isDesktop(layout) ? (
    <aside className={styles.rightSideNav}>
      <ExtensionSlot extensionSlotName={CHARTS_ACTION_MENU_ITEMS_SLOT} />
      <Button
        onClick={() => updateWindowSize('reopen')}
        iconDescription="WorkSpace Items"
        className={`${styles.iconButton} ${openWindows > 0 && styles.activeIconButton} `}
        kind="ghost"
        hasIconOnly>
        <Document20 />
      </Button>
    </aside>
  ) : (
    <button className={styles.actionBtn}>
      <Edit20 />
    </button>
  );

  return (
    <>
      {menu}
      <HeaderPanel className={styles.actionPanel} expanded={open} aria-label="Drawer">
        <ExtensionSlot extensionSlotName={CHARTS_DRAWER_SLOT} />
      </HeaderPanel>
    </>
  );
};

export default ActionMenu;
