import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, SkeletonText, TextArea } from '@carbon/react';
import { formatDate, getCoreTranslation, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import AddStickyNote from './add-sticky-note-button';
import DeleteStickyNote from './delete-sticky-note-button';
import EditStickyNote from './edit-sticky-note-button';
import { createStickyNote, updateStickyNote, useStickyNotes } from './resources';
import styles from './sticky-note-panel.scss';

interface StickyNotePanelProps {
  patientUuid: string;
  onClose: () => void;
}

const StickyNotePanel: React.FC<StickyNotePanelProps> = ({ patientUuid, onClose }) => {
  const { notes: stickyNotes, isLoading, mutate } = useStickyNotes(patientUuid);
  const stickyNote = useMemo(() => {
    return stickyNotes[0] as fhir.Observation;
  }, [stickyNotes]);

  const { t } = useTranslation();
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');
  const [noteText, setNoteText] = useState(stickyNote?.valueString || '');
  const [isSaving, setIsSaving] = useState(false);
  const { stickyNoteConceptUuid } = useConfig<ConfigObject>();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSaving(true);
    try {
      if (mode === 'create') {
        await createStickyNote(patientUuid, noteText, stickyNoteConceptUuid);
        showSnackbar({
          kind: 'success',
          title: t('stickyNoteCreated', 'Sticky note created'),
          subtitle: t('stickyNoteCreatedSuccessfully', 'The sticky note has been created successfully'),
        });
      } else {
        await updateStickyNote(stickyNote.id, noteText, stickyNoteConceptUuid, patientUuid);
        showSnackbar({
          kind: 'success',
          title: t('stickyNoteUpdated', 'Sticky note updated'),
          subtitle: t('stickyNoteUpdatedSuccessfully', 'The sticky note has been updated successfully'),
        });
      }
      setMode('view');
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorSavingStickyNote', 'Error saving sticky note'),
        subtitle: t('errorSavingStickyNoteMessage', 'An error occurred while saving the sticky note'),
      });
      console.error(error);
    } finally {
      mutate();
      setIsSaving(false);
    }
  };

  const handleAddNotes = useCallback(() => {
    setMode('create');
    setNoteText('');
  }, []);

  const handleCancel = () => {
    if (stickyNotes.length === 0) {
      onClose();
    } else {
      setMode('view');
      setNoteText(stickyNote?.valueString || '');
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (stickyNotes.length === 0) {
        setMode('create');
      } else if (mode !== 'create') {
        setNoteText(stickyNote?.valueString || '');
      }
    }
    // eslint-disable-next-line
  }, [isLoading, stickyNotes.length]);

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

  return (
    <div className={styles.stickyNoteContainer}>
      {mode === 'view' ? (
        <>
          <div className={styles.noteContent}>
            <p>{stickyNote?.valueString}</p>
          </div>
          <div className={styles.noteFooter}>
            <div className={styles.noteMetadata}>
              {stickyNote?.effectiveDateTime &&
                formatDate(new Date(stickyNote.effectiveDateTime as string), { mode: 'wide' })}
            </div>
            <div className={styles.noteActions}>
              {stickyNote?.id && (
                <>
                  <AddStickyNote onAddNote={handleAddNotes} />
                  <EditStickyNote
                    toggleEditingStickyNote={() => {
                      setNoteText(stickyNote?.valueString || '');
                      setMode('edit');
                    }}
                  />
                  <DeleteStickyNote noteUuid={stickyNote.id} mutate={mutate} onClose={onClose} />
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className={styles.editContainer}>
          <TextArea
            id="sticky-note-text"
            labelText={t('stickyNote', 'Sticky Note')}
            placeholder={t('enterNotePlaceholder', 'Enter your sticky note here...')}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={5}
            maxLength={1000}
            enableCounter
          />
          <div className={styles.buttonSet}>
            <Button kind="ghost" onClick={handleCancel} disabled={isSaving} size="sm">
              {getCoreTranslation('cancel')}
            </Button>
            <Button kind="primary" type="submit" disabled={!noteText.trim() || isSaving} size="sm">
              {isSaving ? <InlineLoading description={t('saving', 'Saving') + '...'} /> : getCoreTranslation('save')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StickyNotePanel;
