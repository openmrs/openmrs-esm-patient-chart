import React, { type ComponentProps, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeftIcon, formatDate, launchWorkspace, parseDate } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { type MappedList, usePatientListMembers } from '../patient-lists.resource';
import PatientListDetailsTable from './patient-list-details-table.component';
import styles from './patient-list-details.scss';

interface PatientListDetailsWorkspaceProps extends DefaultPatientWorkspaceProps {
  list: MappedList;
}

function PatientListDetailsWorkspace({ list }: PatientListDetailsWorkspaceProps) {
  const { t } = useTranslation();
  const { listMembers, isLoading } = usePatientListMembers(list.id);

  const closeListDetailsWorkspace = useCallback(() => {
    launchWorkspace('patient-lists');
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
          renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
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
