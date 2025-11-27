import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, ButtonSet, TextArea, InlineLoading } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './sticky-note-modal.scss';

interface StickyNoteData {
  id?: string;
  patientUuid: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    uuid: string;
    display: string;
  };
  updatedBy?: {
    uuid: string;
    display: string;
  };
}

interface StickyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUuid: string;
  existingNote?: StickyNoteData | null;
  onSave: (note: string) => Promise<void>;
}

const StickyNoteModal: React.FC<StickyNoteModalProps> = ({ isOpen, onClose, patientUuid, existingNote, onSave }) => {
  const { t } = useTranslation();
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = Boolean(existingNote?.note);

  useEffect(() => {
    if (isOpen) {
      setNoteText(existingNote?.note || '');
    }
  }, [isOpen, existingNote]);

  const handleSave = async () => {
    if (!noteText.trim()) {
      showSnackbar({
        kind: 'error',
        title: t('error', 'Error'),
        subtitle: t('stickyNoteRequired', 'Please enter a note before saving'),
        isLowContrast: false,
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(noteText.trim());
      onClose();
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNoteText(existingNote?.note || '');
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleCancel}
      modalHeading={isEditMode ? t('editStickyNote', 'Edit Sticky Note') : t('newStickyNote', 'New Sticky Note')}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSave}
      className={styles.stickyNoteModal}
    >
      <div className={styles.modalContent}>
        <TextArea
          id="sticky-note-text"
          labelText={t('noteContent', 'Note Content')}
          placeholder={t('enterNotePlaceholder', 'Enter your sticky note here...')}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={6}
          maxLength={1000}
          className={styles.noteTextArea}
        />
        <div className={styles.characterCount}>
          {noteText.length}/1000 {t('characters', 'characters')}
        </div>

        {isEditMode && existingNote && (
          <div className={styles.noteMetadata}>
            <div className={styles.metadataItem}>
              <strong>{t('createdBy', 'Created by')}:</strong> {existingNote.createdBy?.display || 'Unknown'}
            </div>
            <div className={styles.metadataItem}>
              <strong>{t('createdOn', 'Created on')}:</strong>{' '}
              {existingNote.createdAt ? new Date(existingNote.createdAt).toLocaleString() : 'Unknown'}
            </div>
            {existingNote.updatedAt && existingNote.updatedAt !== existingNote.createdAt && (
              <>
                <div className={styles.metadataItem}>
                  <strong>{t('lastUpdatedBy', 'Last updated by')}:</strong>{' '}
                  {existingNote.updatedBy?.display || 'Unknown'}
                </div>
                <div className={styles.metadataItem}>
                  <strong>{t('lastUpdatedOn', 'Last updated on')}:</strong>{' '}
                  {new Date(existingNote.updatedAt).toLocaleString()}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StickyNoteModal;
