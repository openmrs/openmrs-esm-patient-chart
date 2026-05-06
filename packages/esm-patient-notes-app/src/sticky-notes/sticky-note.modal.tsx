import React, { useCallback, useState } from 'react';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader, TextArea } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { createStickyNote, type StickyNoteObs, updateStickyNote } from './sticky-note.resource';
import styles from './sticky-note.modal.scss';

const MAX_NOTE_LENGTH = 300;

interface StickyNoteModalProps {
  close: () => void;
  existingNote?: StickyNoteObs;
  mutate: () => void;
  patientUuid: string;
}

const StickyNoteModal: React.FC<StickyNoteModalProps> = ({ close, existingNote, mutate, patientUuid }) => {
  const { t } = useTranslation();
  const { stickyNoteConceptUuid } = useConfig<ConfigObject>();
  const [value, setValue] = useState(existingNote?.value ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = Boolean(existingNote);
  const trimmed = value.trim();
  const isUnchanged = isEditMode && trimmed === existingNote?.value?.trim();

  const handleSave = useCallback(async () => {
    if (!trimmed || isUnchanged) {
      return;
    }
    setIsSaving(true);
    try {
      if (isEditMode) {
        await updateStickyNote(existingNote.uuid, trimmed);
      } else {
        await createStickyNote(patientUuid, trimmed, stickyNoteConceptUuid);
      }
      showSnackbar({
        kind: 'success',
        title: isEditMode
          ? t('stickyNoteUpdated', 'Sticky note updated')
          : t('stickyNoteCreated', 'Sticky note created'),
      });
      mutate();
      close();
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorSavingStickyNote', 'Error saving sticky note'),
        subtitle: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }, [close, existingNote, isEditMode, isUnchanged, mutate, patientUuid, stickyNoteConceptUuid, t, trimmed]);

  return (
    <>
      <ModalHeader closeModal={close} title={t('stickyNote', 'Sticky note')} />
      <ModalBody>
        <TextArea
          id="sticky-note-text"
          labelText={t('stickyNote', 'Sticky note')}
          hideLabel
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          maxLength={MAX_NOTE_LENGTH}
          enableCounter
          counterMode="character"
          className={styles.textArea}
          placeholder={t('enterNotePlaceholder', 'Enter your sticky note here...')}
        />
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close} disabled={isSaving}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button kind="primary" onClick={handleSave} disabled={!trimmed || isUnchanged || isSaving}>
          {isSaving ? <InlineLoading description={t('saving', 'Saving') + '...'} /> : getCoreTranslation('save')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default StickyNoteModal;
