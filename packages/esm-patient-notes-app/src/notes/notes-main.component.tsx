import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import NotesPagination from './notes-pagination.component';
import styles from './notes-overview.scss';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, InlineLoading } from 'carbon-components-react';
import { useVisit } from '@openmrs/esm-framework';
import { useVisitNotes } from './visit-notes.resource';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  launchStartVisitPrompt,
} from '@openmrs/esm-patient-common-lib';

interface NotesOverviewProps {
  patientUuid: string;
  showAddNote: boolean;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const NotesMain: React.FC<NotesOverviewProps> = ({ patientUuid, showAddNote, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const displayText = t('visitNotes', 'Visit notes');
  const headerTitle = t('visitNotes', 'Visit notes');
  const { visitNotes, isError, isLoading, isValidating } = useVisitNotes(patientUuid);

  const launchVisitNoteForm = React.useCallback(() => {
    if (currentVisit) {
      launchPatientWorkspace('visit-notes-form-workspace');
    } else {
      launchStartVisitPrompt();
    }
  }, [currentVisit]);

  return (
    <>
      {(() => {
        if (isLoading) return <DataTableSkeleton role="progressbar" />;
        if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
        if (visitNotes?.length)
          return (
            <div className={styles.widgetCard}>
              <CardHeader title={headerTitle}>
                <span>{isValidating ? <InlineLoading /> : null}</span>
                {showAddNote && (
                  <Button
                    kind="ghost"
                    renderIcon={Add16}
                    iconDescription="Add visit note"
                    onClick={launchVisitNoteForm}
                  >
                    {t('add', 'Add')}
                  </Button>
                )}
              </CardHeader>
              <NotesPagination notes={visitNotes} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />
            </div>
          );
        return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVisitNoteForm} />;
      })()}
    </>
  );
};

export default NotesMain;
