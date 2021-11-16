import React, { useState } from 'react';
import { Button } from 'carbon-components-react';
import Document20 from '@carbon/icons-react/es/document/20';
import styles from './forms-button.scss';
import { ScreenModeTypes, updateWindowSize, useWorkspaceStore } from '@openmrs/esm-patient-common-lib';
import Close20 from '@carbon/icons-react/es/close/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import { detachAll } from '@openmrs/esm-framework';

interface FormsButtonProps {}

const FormsButton: React.FC<FormsButtonProps> = () => {
  const [mouseHover, setMouseHover] = useState<boolean>(false);
  const { windowSize, isFormsWorkspace } = useWorkspaceStore();

  const active = isFormsWorkspace();
  const handleClick = () => {
    if (active && windowSize.size !== ScreenModeTypes.hide) {
      detachAll('patient-chart-workspace-slot');
    } else {
      updateWindowSize(ScreenModeTypes.normal);
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
        {mouseHover && active && windowSize.size !== ScreenModeTypes.hide ? <Close20 /> : <Document20 />}
        {active && windowSize.size === ScreenModeTypes.hide && <WarningFilled16 className={styles.warningButton} />}
      </div>
    </Button>
  );
};

export default FormsButton;
