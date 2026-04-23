import React, { useCallback } from 'react';
import { Button, SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { formatDate, showModal } from '@openmrs/esm-framework';
import { type StickyNoteObs } from './sticky-note.resource';
import DeleteStickyNote from './delete-sticky-note-button.component';
import EditStickyNote from './edit-sticky-note-button.component';
import styles from './sticky-note-panel.scss';

interface StickyNotePanelProps {
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  note: StickyNoteObs | undefined;
  onClose: () => void;
  patientUuid: string;
}

const StickyNotePanel: React.FC<StickyNotePanelProps> = ({ error, isLoading, mutate, note, onClose, patientUuid }) => {
  const { t } = useTranslation();

  const handleEdit = useCallback(() => {
    if (!note) {
      return;
    }

    const dispose = showModal('sticky-note-modal', {
      close: () => dispose(),
      existingNote: note,
      mutate,
      patientUuid,
    });
  }, [mutate, note, patientUuid]);

  if (isLoading) {
    return (
      <div className={styles.stickyNoteContainer}>
        <div className={styles.noteContent}>
          <SkeletonText paragraph lineCount={3} />
        </div>
        <div className={styles.noteFooter}>
          <SkeletonText width="40%" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stickyNoteContainer}>
        <div className={styles.errorState}>
          <p className={styles.errorTitle}>{t('errorLoadingStickyNote', "Couldn't load sticky note.")}</p>
          <Button kind="ghost" size="sm" onClick={() => mutate()}>
            {t('retry', 'Retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  const creatorDisplay = note.auditInfo?.creator?.display;

  return (
    <div className={styles.stickyNoteContainer}>
      <div className={styles.noteContent}>
        <p>{note.value}</p>
      </div>
      <div className={styles.noteFooter}>
        <div className={styles.noteMetadata}>
          {formatDate(new Date(note.obsDatetime), { mode: 'wide' })}
          {creatorDisplay ? ` · ${creatorDisplay}` : ''}
        </div>
        <div className={styles.noteActions}>
          <EditStickyNote onEdit={handleEdit} />
          <DeleteStickyNote noteUuid={note.uuid} mutate={mutate} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default StickyNotePanel;
