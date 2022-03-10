import React from 'react';
import { useTranslation } from 'react-i18next';
import Pen20 from '@carbon/icons-react/es/pen/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaceWindowSize, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import { Button, HeaderPanel } from 'carbon-components-react';
import { isDesktop } from '../../utils';
import styles from './action-menu.scss';

interface ActionMenuInterface {
  open: boolean;
}

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { windowState, active } = useWorkspaces();
  const { updateWindowSize, windowSize } = useWorkspaceWindowSize();

  const toggleViewMode = () => {
    if (active) {
      if (windowSize.size === 'maximized') {
        updateWindowSize('hidden');
      } else if (windowSize.size === 'normal') {
        updateWindowSize('hidden');
      } else {
        updateWindowSize(windowState);
      }
    }
  };

  const menu = isDesktop(layout) ? (
    <aside className={styles.rightSideNav}>
      <ExtensionSlot extensionSlotName={'action-menu-items-slot'} />
      <Button
        onClick={toggleViewMode}
        iconDescription={t('workspaceItems', 'Workspace items')}
        className={`${styles.iconButton} ${active && styles.activeIconButton} `}
        kind="ghost"
        hasIconOnly
        tooltipPosition="bottom"
        tooltipAlignment="end"
      >
        <>
          <Pen20 /> {windowSize.size === 'hidden' && <WarningFilled16 className={styles.warningButton} />}
        </>
      </Button>
    </aside>
  ) : (
    <ExtensionSlot className={styles.extensionStyles} extensionSlotName={'action-menu-items-slot'} />
  );

  return (
    <>
      {menu}
      <HeaderPanel className={styles.actionPanel} expanded={open} aria-label="Drawer">
        <ExtensionSlot extensionSlotName={'drawer-slot'} />
      </HeaderPanel>
    </>
  );
};

export default ActionMenu;
