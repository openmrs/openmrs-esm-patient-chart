import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { Note } from '../visit.resource';
import styles from '../visit-detail-overview.scss';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

interface NotesSummaryProps {
  notes: Array<Note>;
}

const NotesSummary: React.FC<NotesSummaryProps> = ({ notes }) => {
  const { t } = useTranslation();

  return (
    <>
      {notes.length ? (
        notes.map((note: Note, i) => (
          <div className={styles.notesContainer} key={i}>
            <p className={classNames(styles.noteText, styles.bodyLong01)}>{note.note}</p>
            <p className={styles.metadata}>
              {note.time} {note.provider.name ? <span>&middot; {note.provider.name} </span> : null}
              {note.provider.role ? <span>&middot; {note.provider.role}</span> : null}
            </p>
          </div>
        ))
      ) : (
        <EmptyState displayText={t('notes', 'notes')} headerTitle="Notes"></EmptyState>
      )}
    </>
  );
};

export default NotesSummary;
