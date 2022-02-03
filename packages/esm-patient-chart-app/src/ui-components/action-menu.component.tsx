import React from 'react';
import Edit20 from '@carbon/icons-react/es/edit/20';
import Pen20 from '@carbon/icons-react/es/pen/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import styles from './action-menu.component.scss';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { HeaderPanel, Button } from 'carbon-components-react';
import { isDesktop } from '../utils';
import { useWorkspaceWindow } from '@openmrs/esm-patient-common-lib';
import { useWorkspace } from '../hooks/useWorkspace';
import { useTranslation } from 'react-i18next';
import { WorkspaceWindowState } from '../types';

interface ActionMenuInterface {
  open: boolean;
}

export const CHARTS_DRAWER_SLOT = 'drawer-slot';
export const CHARTS_ACTION_MENU_ITEMS_SLOT = 'action-menu-items-slot';

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { windowState: screenMode, active } = useWorkspace();
  const { openWindows, updateWindowSize, windowSize } = useWorkspaceWindow();

  const checkViewMode = () => {
    if (active) {
      if (windowSize.size === WorkspaceWindowState.maximized) {
        updateWindowSize(WorkspaceWindowState.hidden);
      } else if (windowSize.size === WorkspaceWindowState.normal) {
        updateWindowSize(WorkspaceWindowState.hidden);
      } else {
        updateWindowSize(screenMode);
      }
    }
  };

  const menu = isDesktop(layout) ? (
    <aside className={styles.rightSideNav}>
      <ExtensionSlot extensionSlotName={CHARTS_ACTION_MENU_ITEMS_SLOT} />
      <Button
        onClick={checkViewMode}
        iconDescription={t('workspaceItems', 'Workspace items')}
        className={`${styles.iconButton} ${openWindows > 0 && styles.activeIconButton} `}
        kind="ghost"
        hasIconOnly
        tooltipPosition="bottom"
        tooltipAlignment="end"
      >
        <>
          <Pen20 />{' '}
          {windowSize.size === WorkspaceWindowState.hidden && <WarningFilled16 className={styles.warningButton} />}
        </>
      </Button>
    </aside>
  ) : (
    <Button className={styles.actionBtn}>
      <div>
        <Edit20 />
        {windowSize.size === WorkspaceWindowState.hidden && <WarningFilled16 className={styles.warningButton} />}
      </div>
      <span>{t('careActivities', 'Care Activities')}</span>
    </Button>
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
