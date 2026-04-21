import React, { useCallback } from 'react';
import { SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { formatDate, showModal } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { type StickyNoteObs } from './resources';
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
    if (!note) return;
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
        <ErrorState error={error} headerTitle={t('stickyNote', 'Sticky note')} />
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
