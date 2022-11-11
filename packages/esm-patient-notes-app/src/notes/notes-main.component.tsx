import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useVisit } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  launchStartVisitPrompt,
} from '@openmrs/esm-patient-common-lib';
import { useVisitNotes } from './visit-notes.resource';
import PaginatedNotes from './paginated-notes.component';
import styles from './notes-overview.scss';

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
                    renderIcon={(props) => <Add size={16} {...props} />}
                    iconDescription="Add visit note"
                    onClick={launchVisitNoteForm}
                  >
                    {t('add', 'Add')}
                  </Button>
                )}
              </CardHeader>
              <PaginatedNotes notes={visitNotes} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />
            </div>
          );
        return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVisitNoteForm} />;
      })()}
    </>
  );
};

export default NotesMain;
