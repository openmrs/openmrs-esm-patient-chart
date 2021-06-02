import React from 'react';
import styles from '../visit-detail-overview.scss';

const NotesSummary = ({ notes }) => {
  return notes.length > 0 ? (
    notes.map((note, ind) => (
      <React.Fragment key={ind}>
        <p className={`${styles.medicationBlock} ${styles.bodyLong01}`}>{note.note}</p>
        <p className={styles.caption01} style={{ color: '#525252' }}>
          {note.time} &middot; {note.provider}
        </p>
      </React.Fragment>
    ))
  ) : (
    <p className={styles.bodyLong01}>No notes found.</p>
  );
};

export default NotesSummary;
