import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import NotesPagination from './notes-pagination.component';
import styles from './notes-overview.scss';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, InlineLoading } from 'carbon-components-react';
import { EmptyState, ErrorState, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { attach, useVisit } from '@openmrs/esm-framework';
import { useEncounters } from './encounter.resource';

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
  const { currentVisit } = useVisit(patientUuid);
  const { t } = useTranslation();
  const displayText = t('notes', 'Notes');
  const headerTitle = t('notes', 'Notes');
  const { data: notes, isError, isLoading, isValidating } = useEncounters(patientUuid);

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
        if (isLoading) return <DataTableSkeleton role="progressbar" />;
        if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
        if (notes?.length)
          return (
            <div className={styles.widgetCard}>
              <div className={styles.notesHeader}>
                <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
                <span>{isValidating ? <InlineLoading /> : null}</span>
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
        return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVisitNoteForm} />;
      })()}
    </>
  );
};

export default NotesMain;
