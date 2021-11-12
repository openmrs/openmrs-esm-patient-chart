import React, { useCallback } from 'react';
import Edit20 from '@carbon/icons-react/es/edit/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import styles from './action-menu.component.scss';
import { detachAll, ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import { HeaderPanel, Button } from 'carbon-components-react';
import { isDesktop } from '../utils';
import { useTranslation } from 'react-i18next';
import { ScreenModeTypes } from '../types';
import { patientChartWorkspaceSlot } from '../constants';
import { useContextWorkspace } from '../hooks/useContextWindowSize';
interface ActionMenuInterface {
  open: boolean;
}

export const CHARTS_DRAWER_SLOT = 'drawer-slot';
export const CHARTS_ACTION_MENU_ITEMS_SLOT = 'action-menu-items-slot';

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { windowSize, openWindows, updateWindowSize, screenMode } = useContextWorkspace();

  const checkViewMode = useCallback(
    (active: boolean) => {
      {
        if (active && windowSize.size !== ScreenModeTypes.hide) {
          switch (windowSize.size) {
            case ScreenModeTypes.maximize:
            case ScreenModeTypes.normal:
              detachAll(patientChartWorkspaceSlot);
              break;
          }
        } else if (active) {
          updateWindowSize(screenMode);
        }
      }
    },
    [screenMode, updateWindowSize, windowSize],
  );

  const menu = isDesktop(layout) ? (
    <aside className={styles.rightSideNav}>
      <ExtensionSlot state={{ checkViewMode, windowSize }} extensionSlotName={CHARTS_ACTION_MENU_ITEMS_SLOT} />
    </aside>
  ) : (
    <Button className={styles.actionBtn}>
      <div>
        <Edit20 />
        {windowSize.size === ScreenModeTypes.hide && <WarningFilled16 className={styles.warningButton} />}
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
