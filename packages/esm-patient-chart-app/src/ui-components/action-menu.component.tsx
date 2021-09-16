import React from 'react';
import Edit20 from '@carbon/icons-react/es/edit/20';
import DocumentBlank20 from '@carbon/icons-react/es/document--blank/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import styles from './action-menu.component.scss';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { HeaderPanel, Button } from 'carbon-components-react';
import { isDesktop } from '../utils';
import { useContextWorkspace } from '../hooks/useContextWindowSize';
import { useWorkspace } from '../hooks/useWorkspace';
import { useTranslation } from 'react-i18next';

interface ActionMenuInterface {
  open: boolean;
}

export const CHARTS_DRAWER_SLOT = 'drawer-slot';
export const CHARTS_ACTION_MENU_ITEMS_SLOT = 'action-menu-items-slot';

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { screenMode, active } = useWorkspace();
  const { openWindows, updateWindowSize, windowSize } = useContextWorkspace();

  const checkViewMode = () => {
    if (active) {
      if (windowSize.size === 'maximize') {
        updateWindowSize('hide');
      } else if (windowSize.size === 'normal') {
        updateWindowSize('hide');
      } else {
        updateWindowSize(screenMode);
      }
    }
  };

  const menu = isDesktop(layout) ? (
    <aside className={styles.rightSideNav}>
      <ExtensionSlot extensionSlotName={CHARTS_ACTION_MENU_ITEMS_SLOT} />
      <Button
        onClick={() => checkViewMode()}
        iconDescription="WorkSpace Items"
        className={`${styles.iconButton} ${openWindows > 0 && styles.activeIconButton} `}
        kind="ghost"
        hasIconOnly>
        <div>
          <DocumentBlank20 /> {windowSize.size === 'hide' && <WarningFilled16 className={styles.warningButton} />}
        </div>
      </Button>
    </aside>
  ) : (
    <Button className={styles.actionBtn}>
      <div>
        <Edit20 />
        {windowSize.size === 'hide' && <WarningFilled16 className={styles.warningButton} />}
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
