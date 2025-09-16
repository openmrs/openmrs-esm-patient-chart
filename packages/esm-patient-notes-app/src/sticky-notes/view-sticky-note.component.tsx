import React from 'react';
import styles from './view-sticky-note.scss';
import { EditStickyNote, DeleteStickyNote } from './sticky-note-actions.component';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@openmrs/esm-framework';

interface ViewStickyNoteProps {
  stickyNote: fhir.Observation;
  patientUuid: string;
  toggleEditingStickyNote: () => void;
}

const ViewStickyNote: React.FC<ViewStickyNoteProps> = ({ stickyNote, patientUuid, toggleEditingStickyNote }) => {
  const { t } = useTranslation();
  return (
    <div>
      <p className={styles.stickyNoteContent}>{stickyNote.valueString}</p>
      <div className={styles.noteFooter}>
        <div className={styles.noteMetadata}>
          {formatDate(new Date(stickyNote.effectiveDateTime as string), { mode: 'wide', time: false })} - Vineet Sharma
        </div>
        <div className={styles.noteActions}>
          <DeleteStickyNote observationUuid={stickyNote.id} patientUuid={patientUuid} />
          <EditStickyNote
            observationUuid={stickyNote.id}
            patientUuid={patientUuid}
            toggleEditingStickyNote={toggleEditingStickyNote}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewStickyNote;
