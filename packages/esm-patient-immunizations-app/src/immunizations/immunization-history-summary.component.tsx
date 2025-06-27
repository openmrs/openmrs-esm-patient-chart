import React from 'react';
import { Button, DataTableSkeleton } from '@carbon/react';
import { CardHeader, EmptyState, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { AddIcon, launchWorkspace, useVisit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

import styles from './immunization-history-card.scss';
import { useImmunizations } from '../hooks/useImmunizations';
import ImmunizationHistoryCard from './immunization-history-card.component';

interface ImmunizationScheduleDashboardProps {
  patientUuid: string;
}

const ImmunizationHistoryDashboard: React.FC<ImmunizationScheduleDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useImmunizations(patientUuid);
  const { currentVisit } = useVisit(patientUuid);

  const launchImmunizationsForm = React.useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
      return;
    }
    launchWorkspace('immunization-form-workspace');
  }, [currentVisit]);

  const displayText = t('immunizations__lower', 'immunizations');
  const headerTitle = t('immunizationsHistory', 'Immunizations History');

  if (isLoading) {
    return <DataTableSkeleton columnCount={2} rowCount={5} showHeader zebra />;
  }

  if (data?.length > 0) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <Button
            kind="ghost"
            renderIcon={(props) => <AddIcon size={16} {...props} />}
            iconDescription={t('add', 'Add')}
            onClick={launchImmunizationsForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>

        <div className={styles.content}>
          <ImmunizationHistoryCard patientUuid={patientUuid} />
        </div>
      </div>
    );
  }

  return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
};

export default ImmunizationHistoryDashboard;
