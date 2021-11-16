import React, { useState } from 'react';
import {
  launchPatientWorkspace,
  ScreenModeTypes,
  updateWindowSize,
  useWorkspaceStore,
} from '@openmrs/esm-patient-common-lib';
import { Button } from 'carbon-components-react';
import styles from './order-basket-button.scss';
import ShoppingCart20 from '@carbon/icons-react/es/shopping--cart/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import Close20 from '@carbon/icons-react/es/close/20';
import { detachAll } from '@openmrs/esm-framework';

interface OrderBasketButton {}

const OrderBasketButton: React.FC<OrderBasketButton> = () => {
  const [mouseHover, setMouseHover] = useState<boolean>(false);
  const { windowSize, isWorkspaceOpen } = useWorkspaceStore();

  const active = isWorkspaceOpen('order-basket-workspace');

  const handleClick = () => {
    if (active && windowSize.size !== ScreenModeTypes.hide) {
      detachAll('patient-chart-workspace-slot');
    } else {
      windowSize.size !== ScreenModeTypes.hide
        ? launchPatientWorkspace('order-basket-workspace')
        : updateWindowSize(ScreenModeTypes.normal);
    }
  };
  return (
    <Button
      onClick={() => handleClick()}
      iconDescription="Forms"
      tooltipAlignment="start"
      className={`${styles.iconButton} ${
        active && windowSize.size !== ScreenModeTypes.hide && styles.activeIconButton
      } `}
      kind="ghost"
      hasIconOnly
      onMouseEnter={() => setMouseHover(true)}
      onMouseLeave={() => setMouseHover(false)}
    >
      <div>
        {mouseHover && active && windowSize.size !== ScreenModeTypes.hide ? <Close20 /> : <ShoppingCart20 />}
        {active && windowSize.size === ScreenModeTypes.hide && <WarningFilled16 className={styles.warningButton} />}
      </div>
    </Button>
  );
};

export default OrderBasketButton;
