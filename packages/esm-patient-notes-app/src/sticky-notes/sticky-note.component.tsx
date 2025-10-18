import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStickyNotes } from './resources';
import { showToast } from '@openmrs/esm-framework';
import ViewStickyNote from './view-sticky-note.component';
import styles from './sticky-note.scss';
import EditStickyNoteView from './edit-sticky-note.component';

interface StickyNoteWrapperProps {
  patientUuid: string;
  isNewStickyNote: boolean;
}

const StickyNoteWrapper: React.FC<StickyNoteWrapperProps> = ({ patientUuid, isNewStickyNote }) => {
  const { t } = useTranslation();
  const { stickyNotes, errorFetchingStickyNotes, isLoadingStickyNotes } = useStickyNotes(patientUuid);

  useEffect(() => {
    if (!isLoadingStickyNotes && errorFetchingStickyNotes) {
      showToast({
        title: t('stickyNoteError', 'Error fetching sticky notes'),
        description: errorFetchingStickyNotes?.message,
        kind: 'error',
      });
    }
  }, [isLoadingStickyNotes, errorFetchingStickyNotes, t]);

  return (
    <>
      <StickyNoteComponent
        stickyNote={stickyNotes?.[0] ?? ({} as fhir.Observation)}
        patientUuid={patientUuid}
        isNewStickyNote={isNewStickyNote}
      />
    </>
  );
};

interface StickyNoteComponentProps {
  stickyNote: fhir.Observation;
  patientUuid: string;
  isNewStickyNote: boolean;
}

const StickyNoteComponent: React.FC<StickyNoteComponentProps> = ({ stickyNote, patientUuid, isNewStickyNote }) => {
  const [isEditingStickyNote, setIsEditingStickyNote] = useState(false);

  const showEditView = isNewStickyNote || isEditingStickyNote;

  const toggleEditingStickyNote = (newValue: boolean = !isEditingStickyNote) => {
    setIsEditingStickyNote(newValue);
  };

  return (
    <div className={styles.stickyNoteContainer}>
      {!showEditView ? (
        <ViewStickyNote
          stickyNote={stickyNote}
          patientUuid={patientUuid}
          toggleEditingStickyNote={toggleEditingStickyNote}
        />
      ) : (
        <EditStickyNoteView
          stickyNote={stickyNote}
          patientUuid={patientUuid}
          toggleEditingStickyNote={toggleEditingStickyNote}
          isNewStickyNote={!stickyNote.id}
        />
      )}
    </div>
  );
};

export default StickyNoteWrapper;
