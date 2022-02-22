import React from 'react';
import styles from '../visit-detail-overview.scss';
import { Note } from '../visit.resource';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash-es/capitalize';

interface NotesSummaryProps {
  notes: Array<Note>;
}

const NotesSummary: React.FC<NotesSummaryProps> = ({ notes }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      {notes.length > 0 ? (
        notes.map((note: Note, i) => (
          <div className={styles.notesContainer} key={i}>
            <p className={`${styles.noteText} ${styles.bodyLong01}`}>{note.note}</p>
            <p className={styles.metadata}>
              {note.time} &middot; {note.provider.name}, {note.provider.role}
            </p>
          </div>
        ))
      ) : (
        <p className={`${styles.bodyLong01} ${styles.text02}`}>{t('noNotesFound', 'No notes found')}</p>
      )}
    </React.Fragment>
  );
};

export default NotesSummary;
