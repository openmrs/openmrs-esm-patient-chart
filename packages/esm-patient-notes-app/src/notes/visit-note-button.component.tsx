import React, { useState } from 'react';
import { detachAll } from '@openmrs/esm-framework';
import {
  launchPatientWorkspace,
  ScreenModeTypes,
  updateWindowSize,
  useWorkspaceStore,
} from '@openmrs/esm-patient-common-lib';
import styles from './visit-note-button.scss';
import Close20 from '@carbon/icons-react/es/close/20';
import Pen20 from '@carbon/icons-react/es/pen/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import { Button } from 'carbon-components-react';

interface VisitNoteButtonProps {}

const VisitNoteButton: React.FC<VisitNoteButtonProps> = () => {
  const [mouseHover, setMouseHover] = useState<boolean>(false);
  const { windowSize, isWorkspaceOpen } = useWorkspaceStore();

  const active = isWorkspaceOpen('visit-notes-form-workspace');

  const handleClick = () => {
    if (active && windowSize.size !== ScreenModeTypes.hide) {
      detachAll('patient-chart-workspace-slot');
    } else {
      windowSize.size !== ScreenModeTypes.hide
        ? launchPatientWorkspace('visit-notes-form-workspace')
        : updateWindowSize(ScreenModeTypes.normal);
    }
  };
  return (
    <Button
      onClick={() => handleClick()}
      iconDescription="Visit"
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
        {mouseHover && active && windowSize.size !== ScreenModeTypes.hide ? <Close20 /> : <Pen20 />}
        {active && windowSize.size === ScreenModeTypes.hide && <WarningFilled16 className={styles.warningButton} />}
      </div>
    </Button>
  );
};
export default VisitNoteButton;
