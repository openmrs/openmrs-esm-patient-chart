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
        notes.map((note: Note, ind) => (
          <React.Fragment key={ind}>
            <p className={styles.noteTitle}>{capitalize(note.concept.display)}</p>
            <p className={`${styles.noteText} ${styles.bodyLong01}`}>{note.note}</p>
            <p className={styles.caption01} style={{ color: '#525252' }}>
              {note.time} &middot; {note.provider.name} &middot; {note.provider.role}
            </p>
          </React.Fragment>
        ))
      ) : (
        <p className={`${styles.bodyLong01} ${styles.text02}`}>{t('noNotesFound', 'No notes found')}</p>
      )}
    </React.Fragment>
  );
};

export default NotesSummary;
