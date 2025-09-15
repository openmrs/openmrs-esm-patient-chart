import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { DocumentIcon, useConfig, showSnackbar } from '@openmrs/esm-framework';
import { useStickyNotes, createStickyNote, updateStickyNote } from './use-sticky-notes';
import { type ConfigObject } from '../config-schema';
import StickyNoteModal from './sticky-note-modal.component';
import styles from './note-icon.scss';

interface NoteIconProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const NoteIcon: React.FC<NoteIconProps> = ({ patient, patientUuid }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { stickyNoteConceptUuid } = useConfig<ConfigObject>();
  const { stickyNote, isLoadingStickyNotes, mutateStickyNotes } = useStickyNotes(patientUuid);

  const handleNoteClick = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (note: string) => {
    try {
      if (stickyNote?.uuid) {
        // Update existing note
        await updateStickyNote(stickyNote.uuid, note);
      } else {
        // Create new note
        await createStickyNote(patientUuid, note, stickyNoteConceptUuid);
      }

      // Refresh the data
      mutateStickyNotes();

      showSnackbar({
        kind: 'success',
        title: t('stickyNoteSaved', 'Sticky note saved'),
        subtitle: t('stickyNoteSavedSuccess', 'Your sticky note has been saved successfully'),
        isLowContrast: true,
      });
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('stickyNoteSaveError', 'Error saving sticky note'),
        subtitle: error.message || t('unexpectedError', 'An unexpected error occurred'),
        isLowContrast: false,
      });
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
            renderIcon={DocumentIcon}
            onClick={handleNoteClick}
            className={styles.noteButton}
            disabled={isLoadingStickyNotes}
          >
            {t('stickyNotes', 'Sticky notes')}
          </Button>
          {stickyNote?.note && !isLoadingStickyNotes && <div className={styles.notificationBadge}>1</div>}
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
