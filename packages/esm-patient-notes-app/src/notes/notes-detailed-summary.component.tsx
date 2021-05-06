import React, { useState, useEffect, Fragment } from 'react';
import styles from './notes-detailed-summary.css';
import capitalize from 'lodash-es/capitalize';
import { EmptyState, SummaryCard, usePagination } from '@openmrs/esm-patient-common-lib';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { attach, createErrorHandler } from '@openmrs/esm-framework';
import { formatDate } from './biometric.helper';
import { useNotesContext } from './notes.context';
import { getEncounterObservableRESTAPI, PatientNote } from './encounter.resource';

interface NotesDetailedSummaryProps {
  showAddNote: boolean;
}

const NotesDetailedSummary: React.FC<NotesDetailedSummaryProps> = ({ showAddNote }) => {
  const { t } = useTranslation();
  const { patient, patientUuid } = useNotesContext();
  const [patientNotes, setPatientNotes] = useState<Array<PatientNote>>();
  const pagination = usePagination(patientNotes);

  useEffect(() => {
    if (patient) {
      const subscription = getEncounterObservableRESTAPI(patientUuid).subscribe(
        (notes) => setPatientNotes(notes),
        createErrorHandler(),
      );

      return () => subscription.unsubscribe();
    }
  }, [patientUuid, patient]);

  return (
    <>
      {patientNotes && (
        <div className={styles.notesSummary}>
          {patientNotes.length > 0 ? (
            <SummaryCard
              name={t('notes', 'Notes')}
              addComponent={showAddNote}
              showComponent={() => attach('patient-chart-workspace-slot', 'visit-notes-workspace')}>
              <table className={`omrs-type-body-regular ${styles.notesTable}`}>
                <thead>
                  <tr className={styles.notesTableRow} style={{ textTransform: 'uppercase' }}>
                    <th>{t('date', 'Date')}</th>
                    <th style={{ textAlign: 'left' }}>
                      {t('note', 'Note')}
                      <svg
                        className="omrs-icon"
                        style={{
                          height: '0.813rem',
                          fill: 'var(--omrs-color-ink-medium-contrast)',
                        }}>
                        <use xlinkHref="#omrs-icon-arrow-downward"></use>
                      </svg>
                      <span style={{ marginLeft: '1.25rem' }}>{t('location', 'Location')}</span>
                    </th>
                    <th style={{ textAlign: 'left' }}>{t('author', 'Author')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.results.map((note) => {
                    return (
                      <Fragment key={note.id}>
                        <tr className={styles.notesTableDataRow}>
                          <td className={styles.noteDate}>{formatDate(note?.encounterDate)}</td>
                          <td className={styles.noteInfo}>
                            <span className="omrs-medium">{note.encounterType}</span>
                            <div
                              style={{
                                color: 'var(--omrs-color-ink-medium-contrast)',
                                margin: '0rem',
                              }}>
                              {capitalize(note.encounterLocation)}
                            </div>
                          </td>
                          <td className={styles.noteAuthor}>
                            {note.encounterAuthor ? note.encounterAuthor : '\u2014'}
                          </td>
                          <td
                            style={{
                              textAlign: 'end',
                              paddingRight: '0.625rem',
                            }}>
                            <Link to={`/${note.id}`}>
                              <svg className="omrs-icon">
                                <use
                                  fill="var(--omrs-color-ink-low-contrast)"
                                  xlinkHref="#omrs-icon-chevron-right"></use>
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              <div className={styles.pagination}>
                <div>
                  {pagination.showPreviousButton && (
                    <button
                      onClick={pagination.goToPrevious}
                      className={`${styles.navButton} omrs-bold omrs-btn omrs-text-neutral omrs-rounded`}>
                      <svg className="omrs-icon" fill="var(--omrs-color-ink-low-contrast)">
                        <use xlinkHref="#omrs-icon-chevron-left" />
                      </svg>
                      {t('previous', 'Previous')}
                    </button>
                  )}
                </div>
                {pagination.paginated ? (
                  <div>
                    {t('page', 'Page')} {pagination.currentPage} {t('of', 'of')} {pagination.totalPages}
                  </div>
                ) : (
                  <div className="omrs-type-body-regular" style={{ fontFamily: 'Work Sans' }}>
                    <p style={{ color: 'var(--omrs-color-ink-medium-contrast)' }}>
                      {t('noMoreNotesAvailable', 'No more notes available')}
                    </p>
                  </div>
                )}
                <div>
                  {pagination.showNextButton && (
                    <button
                      onClick={pagination.goToNext}
                      className={`${styles.navButton} omrs-bold omrs-btn omrs-text-neutral omrs-rounded`}>
                      {t('next', 'Next')}
                      <svg className="omrs-icon" fill="var(--omrs-color-ink-low-contrast)">
                        <use xlinkHref="#omrs-icon-chevron-right" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </SummaryCard>
          ) : (
            <EmptyState
              displayText={t('notes', 'Notes')}
              headerTitle={t('notes', 'Notes')}
              launchForm={() => attach('patient-chart-workspace-slot', 'visit-notes-workspace')}
            />
          )}
        </div>
      )}
    </>
  );
};

export default NotesDetailedSummary;
