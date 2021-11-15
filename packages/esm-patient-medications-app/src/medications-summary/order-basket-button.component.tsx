import React, { useState, useMemo } from 'react';
import { launchPatientWorkspace, ScreenModeTypes, WindowSize } from '@openmrs/esm-patient-common-lib';
import { Button } from 'carbon-components-react';
import styles from './order-basket-button.scss';
import ShoppingCart20 from '@carbon/icons-react/es/shopping--cart/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import Close20 from '@carbon/icons-react/es/close/20';
import { useAssignedExtensionIds } from '@openmrs/esm-framework';

interface OrderBasketButton {
  windowSize: WindowSize;
  checkViewMode: (active: boolean) => void;
}

const OrderBasketButton: React.FC<OrderBasketButton> = ({ windowSize, checkViewMode }) => {
  const extensions = useAssignedExtensionIds('patient-chart-workspace-slot');
  const [mouseHover, setMouseHover] = useState<boolean>(false);

  const active = useMemo(() => extensions.some((ext) => ext === 'order-basket-workspace'), [extensions]);

  const handleClick = () => (active ? checkViewMode(active) : launchPatientWorkspace('order-basket-workspace'));

  return (
    <Button
      onClick={handleClick}
      iconDescription="Orders"
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
