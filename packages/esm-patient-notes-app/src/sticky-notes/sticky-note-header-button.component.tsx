import React, { useCallback, useState } from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { DocumentIcon, showModal } from '@openmrs/esm-framework';
import { useStickyNote } from './resources';
import StickyNotePanel from './sticky-note-panel.component';
import styles from './sticky-note-header-button.scss';

interface StickyNoteHeaderButtonProps {
  patientUuid: string;
}

const StickyNoteHeaderButton: React.FC<StickyNoteHeaderButtonProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [showPanel, setShowPanel] = useState(false);
  const { note, isLoading, error, mutate } = useStickyNote(patientUuid);

  const handleClose = useCallback(() => {
    setShowPanel(false);
  }, []);

  const handleClick = useCallback(() => {
    if (note) {
      setShowPanel((prev) => !prev);
    } else {
      const dispose = showModal('sticky-note-modal', {
        close: () => dispose(),
        mutate,
        patientUuid,
      });
    }
  }, [mutate, note, patientUuid]);

  return (
    <div className={styles.content}>
      <Button
        kind="ghost"
        size="sm"
        renderIcon={(props) => (
          <div>
            <DocumentIcon {...props} />
            {note && <span className={styles.notificationBadge}>1</span>}
          </div>
        )}
        onClick={handleClick}
      >
        {t('stickyNote', 'Sticky note')}
      </Button>
      {showPanel && (
        <StickyNotePanel
          error={error}
          isLoading={isLoading}
          mutate={mutate}
          note={note}
          onClose={handleClose}
          patientUuid={patientUuid}
        />
      )}
    </div>
  );
};

export default StickyNoteHeaderButton;
