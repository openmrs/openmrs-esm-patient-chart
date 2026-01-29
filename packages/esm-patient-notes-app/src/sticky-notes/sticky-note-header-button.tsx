import React, { useCallback, useState } from 'react';
import { Button } from '@carbon/react';
import { DocumentIcon } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useStickyNotes } from './resources';
import styles from './sticky-note-header-button.scss';
import StickyNotePanel from './sticky-note-panel';

interface StickyNoteHeaderButtonProps {
  patientUuid: string;
}

const StickyNoteHeaderButton = ({ patientUuid }: StickyNoteHeaderButtonProps) => {
  const { t } = useTranslation();
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const { notes: stickyNotes } = useStickyNotes(patientUuid);

  const handleClose = useCallback(() => {
    setShowStickyNotes(false);
  }, []);

  return (
    <>
      <div className={styles.content}>
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
          onClick={() => {
            setShowStickyNotes(!showStickyNotes);
          }}
        >
          {t('stickyNotes', 'Sticky notes')}
        </Button>
        {showStickyNotes && (
          <StickyNotePanel key={stickyNotes[0]?.id} patientUuid={patientUuid} onClose={handleClose} />
        )}
      </div>
      <div style={{ clear: 'both' }} />
    </>
  );
};
export default StickyNoteHeaderButton;
