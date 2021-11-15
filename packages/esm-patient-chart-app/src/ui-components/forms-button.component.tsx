import React, { useState } from 'react';
import { Button } from 'carbon-components-react';
import Document20 from '@carbon/icons-react/es/document/20';
import styles from './forms-button.scss';
import { ScreenModeTypes, WindowSize } from '@openmrs/esm-patient-common-lib';
import Close20 from '@carbon/icons-react/es/close/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import { patientChartWorkspaceSlot } from '../constants';
import { useAssignedExtensionIds } from '@openmrs/esm-framework';

interface FormsButtonProps {
  checkViewMode: (active: boolean) => void;
  windowSize: WindowSize;
}

const FormsButton: React.FC<FormsButtonProps> = ({ checkViewMode, windowSize }) => {
  const extensions = useAssignedExtensionIds(patientChartWorkspaceSlot);
  const [mouseHover, setMouseHover] = useState<boolean>(false);

  const active =
    !(
      extensions.filter((ext) => ext === 'order-basket-workspace' || ext === 'visit-notes-form-workspace').length > 0
    ) && extensions.length > 0;

  return (
    <Button
      onClick={() => checkViewMode(active)}
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
        {mouseHover && active && windowSize.size !== ScreenModeTypes.hide ? <Close20 /> : <Document20 />}
        {active && windowSize.size === ScreenModeTypes.hide && <WarningFilled16 className={styles.warningButton} />}
      </div>
    </Button>
  );
};

export default FormsButton;
