import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { AddIcon, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  launchStartVisitPrompt,
  usePatientChartStore,
} from '@openmrs/esm-patient-common-lib';
import { useVisitNotes } from './visit-notes.resource';
import PaginatedNotes from './paginated-notes.component';
import styles from './notes-overview.scss';

interface NotesOverviewProps {
  patientUuid: string;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const NotesMain: React.FC<NotesOverviewProps> = ({ patientUuid, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const { currentVisit } = usePatientChartStore().visits;
  const displayText = t('visitNotes', 'Visit notes');
  const headerTitle = t('visitNotes', 'Visit notes');
  const { visitNotes, error, isLoading, isValidating } = useVisitNotes(patientUuid);
  const layout = useLayoutType();
  const isDesktop = layout === 'large-desktop' || layout === 'small-desktop';

  const launchVisitNoteForm = React.useCallback(() => {
    if (currentVisit) {
      launchWorkspace('visit-notes-form-workspace');
    } else {
      launchStartVisitPrompt();
    }
  }, [currentVisit]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (!visitNotes?.length) {
    return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVisitNoteForm} />;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <span>{isValidating ? <InlineLoading /> : null}</span>
        <Button
          kind="ghost"
          renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
          iconDescription="Add visit note"
          onClick={launchVisitNoteForm}
        >
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <PaginatedNotes notes={visitNotes} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />
    </div>
  );
};

export default NotesMain;
