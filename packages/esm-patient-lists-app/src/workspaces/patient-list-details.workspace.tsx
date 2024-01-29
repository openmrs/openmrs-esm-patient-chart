import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { type DefaultWorkspaceProps, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { type MappedList, usePatientListMembers } from '../patient-lists.resource';
import PatientListDetailsTable from './patient-list-details-table.component';
import styles from './patient-list-details.scss';

interface PatientListDetailsWorkspaceProps extends DefaultWorkspaceProps {
  list: MappedList;
}

function PatientListDetailsWorkspace({ closeWorkspace, list }: PatientListDetailsWorkspaceProps) {
  const { t } = useTranslation();
  const { listMembers, isLoading } = usePatientListMembers(list.id);

  const closeListDetailsWorkspace = useCallback(() => {
    closeWorkspace({
      onWorkspaceClose: () => launchPatientWorkspace('patient-lists'),
    });
  }, []);

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h4 className={styles.description}>{list.description ?? '--'}</h4>
        <p className={styles.details}>
          {list.size} {t('patients', 'patients')} &middot;{' '}
          <span className={styles.label}>{t('createdOn', 'Created on')}:</span>{' '}
          {list.startDate ? formatDate(parseDate(list.startDate)) : null}
        </p>
      </section>
      <div className={styles.backButton}>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeft size={24} {...props} />}
          iconDescription="Back to patient lists"
          size="sm"
          onClick={closeListDetailsWorkspace}
        >
          <span>{t('backToPatientLists', 'Back to patient lists')}</span>
        </Button>
      </div>
      <section className={styles.tableContainer}>
        <PatientListDetailsTable isLoading={isLoading} listMembers={listMembers} />
      </section>
    </main>
  );
}

export default PatientListDetailsWorkspace;
