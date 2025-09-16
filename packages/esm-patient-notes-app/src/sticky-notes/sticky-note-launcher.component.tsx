import React, { lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton } from '@carbon/react';
import { DocumentIcon, useOnClickOutside } from '@openmrs/esm-framework';
import { useStickyNotes } from './resources';
import styles from './sticky-note-launcher.scss';

const StickyNoteWrapper = lazy(() => import('./sticky-note.component'));

interface StickyNoteLauncherProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const StickyNoteLauncher: React.FC<StickyNoteLauncherProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [isStickyNoteOpen, setIsStickyNoteOpen] = useState(false);

  const { stickyNotes, isLoadingStickyNotes } = useStickyNotes(patientUuid);

  const toggleStickyNote = () => {
    setIsStickyNoteOpen(!isStickyNoteOpen);
  };

  const ref = useOnClickOutside(toggleStickyNote, isStickyNoteOpen);

  if (isLoadingStickyNotes) {
    return <ButtonSkeleton size="sm" />;
  }

  return (
    <>
      <Button
        kind="ghost"
        size="sm"
        renderIcon={(props) => (
          <div>
            <DocumentIcon {...props} />
            {stickyNotes && stickyNotes.length > 0 && (
              <span className={styles.notificationBadge}>{stickyNotes.length}</span>
            )}
          </div>
        )}
        onClick={toggleStickyNote}
      >
        {t('stickyNotes', 'Sticky notes')}
      </Button>
      {isStickyNoteOpen && (
        <div ref={ref as React.RefObject<HTMLDivElement>}>
          <StickyNoteWrapper patientUuid={patientUuid} isNewStickyNote={!stickyNotes?.length} />
        </div>
      )}
    </>
  );
};

export default StickyNoteLauncher;
