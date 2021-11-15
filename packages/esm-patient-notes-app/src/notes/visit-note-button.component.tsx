import React, { useState, useMemo } from 'react';
import { useAssignedExtensionIds } from '@openmrs/esm-framework';
import { launchPatientWorkspace, ScreenModeTypes, WindowSize } from '@openmrs/esm-patient-common-lib';
import styles from './visit-note-button.scss';
import Close20 from '@carbon/icons-react/es/close/20';
import Pen20 from '@carbon/icons-react/es/pen/20';
import WarningFilled16 from '@carbon/icons-react/es/warning--filled/16';
import { Button } from 'carbon-components-react';

interface VisitNoteButtonProps {
  windowSize: WindowSize;
  checkViewMode: (active: boolean) => void;
}

const VisitNoteButton: React.FC<VisitNoteButtonProps> = ({ checkViewMode, windowSize }) => {
  const extensions = useAssignedExtensionIds('patient-chart-workspace-slot');
  const [mouseHover, setMouseHover] = useState<boolean>(false);

  const active = useMemo(() => extensions.some((ext) => ext === 'visit-notes-form-workspace'), [extensions]);

  const handleClick = () => (active ? checkViewMode(active) : launchPatientWorkspace('visit-notes-form-workspace'));

  return (
    <Button
      onClick={handleClick}
      iconDescription="Visit"
      tooltipAlignment="start"
      className={`${styles.iconButton} ${active && styles.activeIconButton} `}
      kind="ghost"
      hasIconOnly
      onMouseEnter={() => setMouseHover(true)}
      onMouseLeave={() => setMouseHover(false)}
    >
      <div>
        {mouseHover && active ? <Close20 /> : <Pen20 />}
        {active && windowSize.size === ScreenModeTypes.hide && <WarningFilled16 className={styles.warningButton} />}
      </div>
    </Button>
  );
};
export default VisitNoteButton;
