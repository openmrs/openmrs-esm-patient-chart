import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import NotesPagination from './notesPagination.component';
import styles from './notes-overview.scss';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton } from 'carbon-components-react';
import { EmptyState, ErrorState, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { attach, useVisit } from '@openmrs/esm-framework';
import { getEncounterObservableRESTAPI, PatientNote } from './encounter.resource';

interface NotesOverviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  showAddNote: boolean;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const NotesMain: React.FC<NotesOverviewProps> = ({
  patientUuid,
  patient,
  showAddNote,
  pageSize,
  urlLabel,
  pageUrl,
}) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const [notes, setNotes] = React.useState<Array<PatientNote>>(null);
  const [error, setError] = React.useState(null);
  const displayText = t('notes', 'Notes');
  const headerTitle = t('notes', 'Notes');

  React.useEffect(() => {
    if (patient && patientUuid) {
      const sub = getEncounterObservableRESTAPI(patientUuid).subscribe(setNotes, setError);
      return () => sub.unsubscribe();
    }
  }, [patient, patientUuid]);

  const launchVisitNoteForm = React.useCallback(() => {
    if (currentVisit) {
      attach('patient-chart-workspace-slot', 'visit-notes-form-workspace');
    } else {
      launchStartVisitPrompt();
    }
  }, [currentVisit]);

  return (
    <>
      {(() => {
        if (notes && !notes?.length)
          return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVisitNoteForm} />;
        if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
        if (notes?.length)
          return (
            <div className={styles.widgetCard}>
              <div className={styles.notesHeader}>
                <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
                {showAddNote && (
                  <Button
                    kind="ghost"
                    renderIcon={Add16}
                    iconDescription="Add visit note"
                    onClick={launchVisitNoteForm}>
                    {t('add', 'Add')}
                  </Button>
                )}
              </div>
              <NotesPagination notes={notes} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />
            </div>
          );
        return <DataTableSkeleton rowCount={pageSize} />;
      })()}
    </>
  );
};

export default NotesMain;
