import React, { type ComponentProps, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeftIcon, formatDate, parseDate, Workspace2 } from '@openmrs/esm-framework';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import { type MappedList, usePatientListMembers } from '../patient-lists.resource';
import PatientListDetailsTable from './patient-list-details-table.component';
import styles from './patient-list-details.scss';

export interface PatientListDetailsWorkspaceProps {
  list: MappedList;
}

const PatientListDetailsWorkspace: React.FC<
  PatientWorkspace2DefinitionProps<PatientListDetailsWorkspaceProps, object>
> = ({ workspaceProps: { list }, closeWorkspace }) => {
  const { t } = useTranslation();
  const { listMembers, isLoading } = usePatientListMembers(list.id);

  const closeListDetailsWorkspace = useCallback(() => closeWorkspace(), [closeWorkspace]);

  return (
    <Workspace2
      title={list.name || t('patientListDetailWorkspaceTitle', 'Patient List Details')}
      hasUnsavedChanges={false}
    >
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
    </Workspace2>
  );
};

export default PatientListDetailsWorkspace;
