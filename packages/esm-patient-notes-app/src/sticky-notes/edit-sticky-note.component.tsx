import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation, useConfig } from '@openmrs/esm-framework';
import { TextArea, Button, ButtonSet, InlineLoading } from '@carbon/react';
import { createStickyNote, updateStickyNote, useStickyNotes } from './resources';
import type { ConfigObject } from '../config-schema';
import styles from './sticky-note.scss';

interface ViewStickyNoteProps {
  stickyNote: fhir.Observation;
  patientUuid: string;
  toggleEditingStickyNote: (newValue?: boolean) => void;
  isNewStickyNote: boolean;
}

const EditStickyNoteView: React.FC<ViewStickyNoteProps> = ({
  stickyNote,
  patientUuid,
  toggleEditingStickyNote,
  isNewStickyNote,
}) => {
  const { t } = useTranslation();
  const [noteText, setNoteText] = useState(stickyNote?.valueString ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorSaving, setErrorSaving] = useState(null);
  const { stickyNoteConceptUuid } = useConfig<ConfigObject>();
  const { mutateStickyNotes } = useStickyNotes(patientUuid);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (noteText.trim()) {
        setIsSaving(true);
        const value = noteText.trim();
        const promise = isNewStickyNote
          ? createStickyNote(patientUuid, value, stickyNoteConceptUuid)
          : updateStickyNote(stickyNote.id, value);

        promise
          .then(() => {
            mutateStickyNotes();
            toggleEditingStickyNote(false);
          })
          .catch((error: Error) => {
            setErrorSaving(error?.message ?? t('errorSavingStickyNote', 'Error saving sticky note'));
          })
          .finally(() => {
            setIsSaving(false);
          });
      }
    },
    [
      noteText,
      isNewStickyNote,
      patientUuid,
      stickyNoteConceptUuid,
      toggleEditingStickyNote,
      t,
      stickyNote.id,
      mutateStickyNotes,
    ],
  );
  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.noteTextArea}>
        <TextArea
          id="sticky-note-text"
          labelText={t('stickyNote', 'Sticky Note')}
          placeholder={t('enterNotePlaceholder', 'Enter your sticky note here...')}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={6}
          maxLength={300}
          counterMode="character"
          enableCounter
          invalid={Boolean(errorSaving)}
          invalidText={errorSaving}
          // className={styles.noteTextArea}
        />
      </div>
      <ButtonSet>
        <Button kind="ghost" onClick={() => toggleEditingStickyNote()} disabled={isSaving}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button kind="primary" type="submit">
          {!isSaving ? getCoreTranslation('save') : <InlineLoading description={t('saving', 'Saving...')} />}
        </Button>
      </ButtonSet>
    </form>
  );
};

export default EditStickyNoteView;
