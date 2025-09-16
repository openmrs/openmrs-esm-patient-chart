import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton } from '@carbon/react';
import { DocumentIcon } from '@openmrs/esm-framework';
import { useStickyNotes } from './resources';
import styles from './sticky-note-launcher.scss';

interface StickyNoteLauncherProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const StickyNoteLauncher: React.FC<StickyNoteLauncherProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const { stickyNotes, isLoadingStickyNotes } = useStickyNotes(patientUuid);

  if (isLoadingStickyNotes) {
    return <ButtonSkeleton size="sm" />;
  }

  return (
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
    >
      {t('stickyNotes', 'Sticky notes')}
    </Button>
  );
};

export default StickyNoteLauncher;
