import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Document } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { useStickyNotes } from './use-sticky-notes';
import StickyNoteModal from './sticky-note-modal.component';
import styles from './note-icon.scss';

interface NoteIconProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const NoteIcon: React.FC<NoteIconProps> = ({ patient, patientUuid }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { stickyNote, isLoading, fetchStickyNote, saveStickyNote, updateStickyNote } = useStickyNotes(patientUuid);

  useEffect(() => {
    fetchStickyNote();
  }, [fetchStickyNote]);

  const handleNoteClick = async () => {
    // Fetch the latest sticky note data before opening modal
    await fetchStickyNote();
    setIsModalOpen(true);
  };

  const handleSave = async (note: string) => {
    if (stickyNote) {
      // Update existing note
      await updateStickyNote(note);
    } else {
      // Create new note
      await saveStickyNote(note);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles.noteIconContainer}>
        <div className={styles.buttonWrapper}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Document}
            onClick={handleNoteClick}
            className={styles.noteButton}
            disabled={isLoading}
          >
            {t('stickyNotes', 'Sticky notes')}
          </Button>
          {stickyNote?.note && !isLoading && <div className={styles.notificationBadge}>1</div>}
        </div>
      </div>

      <StickyNoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        patientUuid={patientUuid}
        existingNote={stickyNote}
        onSave={handleSave}
      />
    </>
  );
};

export default NoteIcon;
